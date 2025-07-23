import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ConflictException,
    Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Resident, ResidentDocument } from '@models/users/resident.model';

import { Payer, PayerDocument } from '@models/users/payer.model';
import {
    sendConfirmationMail,
    sendResetEmail,
    sendLoginCodeEmail,
} from '@utils/mailer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKeys } from '@src/shared/constants';
import { getSeconds } from 'date-fns';
import { UserRole } from '@models/types';
import { JwtService } from '@nestjs/jwt';
import { CreateResidentAccountDto, ResidentLoginDto, ResidentVerifyResetCodeDto, ResidentForgotPasswordDto } from './dto/resident.dto';

const JWT_SECRET = process.env.JWT_SECRET;

@Injectable()
export class ResidentService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheService: Cache,
        private readonly jwtService: JwtService,
        @InjectModel(Resident.name) private readonly residentModel: Model<ResidentDocument>,
        @InjectModel(Payer.name) private readonly payerModel: Model<PayerDocument>,
    ) { }


    async registerResident(body: CreateResidentAccountDto) {
        const { payerId, password, confirmPassword } = body;

        if (password !== confirmPassword) {
            throw new BadRequestException(
                'Password and confirm password do not match',
            );
        }

        const existing = await this.residentModel.findOne({ payerId });
        if (existing) {
            throw new ConflictException('Resident already registered with this payerId');
        }

        const payer = await this.payerModel.findOne({ payerId });
        if (!payer) {
            throw new NotFoundException('Invalid payerId');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newResident = await this.residentModel.create({
            payerId,
            firstName: payer.firstName,
            lastName: payer.lastName,
            email: payer.email,
            password: hashedPassword,
            phoneNumber: payer.phoneNumber,

        });

        await sendConfirmationMail(newResident.email, newResident.firstName);

        return {
            message: 'Resident registered successfully',
            data: {
                id: newResident._id,
                payerId: newResident.payerId,
                fullName: `${newResident.firstName} ${newResident.lastName}`,
                email: newResident.email,
                phoneNumber: newResident.phoneNumber
            },
        };
    }


    async login(body: ResidentLoginDto) {
        const { email, password } = body;
        const resident = await this.residentModel.findOne({ email });
        if (!resident || !(await bcrypt.compare(password, resident.password))) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const loginCode = Math.floor(10000 + Math.random() * 90000).toString();
        const loginCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

        resident.loginCode = loginCode;
        resident.loginCodeExpiry = loginCodeExpiry;
        await resident.save();

        const ttlSeconds = getSeconds(loginCodeExpiry);
        await this.cacheService.set(
            CacheKeys.ResidentLoginCode(String(loginCode)),
            String(resident._id),
            ttlSeconds,
        );

        await sendLoginCodeEmail(resident.email, resident.firstName, loginCode);
    }


    async verifyLoginCode(loginCode: string) {
        const verificationCode = await this.cacheService.get(
            CacheKeys.ResidentLoginCode(loginCode),
        );

        if (!verificationCode) {
            throw new UnauthorizedException('Session expired. Please log in again.');
        }

        const resident = await this.residentModel
            .findOne({
                _id: verificationCode,
                loginCode,
                loginCodeExpiry: { $gt: Date.now() },
            })
            .select('-password')
            .lean();

        if (!resident) {
            throw new BadRequestException('Invalid or expired login code');
        }

        const token = jwt.sign(
            {
                id: resident._id,
                role: UserRole.Resident,
                payerId: resident.payerId,
                email: resident.email,
            },
            JWT_SECRET,
            { expiresIn: '7d' },
        );

        return { message: 'Login successful', token, data: resident };
    }


    async updateProfilePicture(userId: string, filePath: string) {
        const resident = await this.residentModel.findById(userId);
        if (!resident) {
            throw new NotFoundException('Resident not found');
        }

        resident.profilePicture = filePath;
        await resident.save();

        return {
            message: 'Profile picture updated successfully',
            profilePicture: resident.profilePicture,
        };
    }

    async getProfile(residentId: string) {
        const resident = await this.residentModel
            .findById(residentId)
            .select('firstName lastName profilePicture')
            .lean();
        if (!resident) {
            throw new NotFoundException('Resident not found');
        }

        const defaultAvatar =
            'https://res.cloudinary.com/demo/image/upload/avatar.png';
        return {
            ...resident,
            profilePicture: resident.profilePicture || defaultAvatar,
        };
    }


    async requestPasswordReset(body: ResidentForgotPasswordDto) {
        const { email } = body
        const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
        const resetTokenExpiry = new Date(Date.now() + 20 * 60 * 1000);

        const resident = await this.residentModel.findOneAndUpdate(
            { email },
            { $set: { resetToken: resetCode, resetTokenExpiry } },
            { new: false },
        );

        if (resident) {
            await sendResetEmail(resident.email, resident.firstName, resetCode);
        }

        return {
            message:
                'If an account with that email exists, a reset code has been sent',
            email,
        };
    }

    async verifyPasswordResetCode(body: ResidentVerifyResetCodeDto, session: any) {
        const { code } = body;
        const resident = await this.residentModel.findOne({
            resetToken: code,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!resident) {
            throw new BadRequestException('Invalid or expired reset code');
        }

        session.passwordResetUserId = resident._id;
        return { message: 'Code verified. You can now reset your password.' };
    }

    async resetPassword(
        newPassword: string,
        confirmPassword: string,
        session: any,
    ) {
        const userId = session.passwordResetUserId;
        if (!userId) {
            throw new UnauthorizedException(
                'Reset session expired. Please verify code again.',
            );
        }

        if (
            !newPassword ||
            newPassword !== confirmPassword ||
            newPassword.length < 6
        ) {
            throw new BadRequestException('Passwords do not match or are too short');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.residentModel.updateOne(
            { _id: userId },
            {
                $set: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null,
                },
            },
        );

        session.passwordResetUserId = null;
        return { message: 'Password has been reset successfully' };
    }



    async logout() {

        return { message: 'Logged out successfully' };
    }


    async getAgentDetailsByToken(token: string) {
        const tokenDetails = await this.jwtService.decode(token);
        if (!tokenDetails) {
            throw new UnauthorizedException('unable to unauthenticate');
        }

        return this.getProfile(tokenDetails.id);
    }

}
