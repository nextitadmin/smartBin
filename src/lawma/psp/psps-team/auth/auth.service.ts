import { comparePassword } from '@common/utils';
import { PSP } from '@models/psp.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from "@nestjs/mongoose";
import { CacheKeys } from "@src/shared/constants";
import { Cache } from "cache-manager"
import { Model } from "mongoose";
import { PspForgotPasswordDto, PspLoginDto, PspResetPasswordDto, PspVerifyResetCodeDto } from "../../dto/psp.dto";
import { MailNotificationEvents, SendEmailEvent } from "@src/notification/dto/event";
import { ApplicationEnvironment } from "@common/constants";
import { PSPMembers } from '@models/psp-members.model';

@Injectable()
export class PspTeamAuthService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheService: Cache,
        @InjectModel(PSPMembers.name) private readonly pspMemberModel: Model<PSPMembers>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private ee: EventEmitter2,
    ) { }


    get isProduction() {
        const environment = this.configService.get('applicationEnvironment');
        return environment === ApplicationEnvironment.Production;
    }

    async login(body: PspLoginDto) {
        const { email, password } = body;

        const psp = await this.pspMemberModel.findOne({ email });

        if (!psp) {
            throw new NotFoundException('Psp not found');
        }

        const isPasswordMatch = comparePassword(password, psp.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const loginCode = !this.isProduction ? '12345' : Math.floor(10000 + Math.random() * 90000).toString();

        await this.cacheService.set(
            CacheKeys.PspLoginCode(String(loginCode)),
            String(psp._id),
        );

        this.ee.emit(
            MailNotificationEvents.Account.VerificationOTP,
            new SendEmailEvent({
                to: String(psp.email),
                from: `"LAWMA REG" <no-reply@resend.dev>`,
                subject: 'Your Login Verification Code',
                context: {
                    firstName: psp.name,
                    loginCode,
                },
            }),
        );
    }

    async verifyLoginCode(loginCode: string) {
        const pspId = await this.cacheService.get(
            CacheKeys.PspLoginCode(loginCode),
        );

        if (!pspId) {
            throw new UnauthorizedException('Session expired. Please log in again.');
        }

        const pspMember = await this.pspMemberModel
            .findOne({
                _id: pspId,
            })
            .select('-password')
            .lean();

        if (!pspMember) {
            throw new BadRequestException('Invalid or expired login code');
        }
        const secret = String(this.configService.get<string>('JWT_SECRET'));
        const token = jwt.sign(
            {
                id: pspMember._id,
                email: pspMember.email,
            },
            secret,
            { expiresIn: '7d' },
        );

        return { message: 'Login successful', token, data: pspMember };
    }

    async requestPasswordReset(body: PspForgotPasswordDto) {
        const { email } = body;
        const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
        const expiry = 600000;

        const pspMember = await this.pspMemberModel.findOne({ administrator_email: email });
        if (pspMember) {
            await this.cacheService.set(
                CacheKeys.PspResetPasswordCode(String(resetCode)),
                String(pspMember._id),
                expiry,
            );
            this.ee.emit(
                MailNotificationEvents.Account.ForgotPassword,
                new SendEmailEvent({
                    to: pspMember.email,
                    from: `"LAWMA REG" <accounts@lawma.co>`,
                    subject: 'Password Reset Request',
                    context: {
                        firstName: pspMember.name,
                        resetCode,
                    },
                }),
            );
        }
        return {
            message:
                'If an account with that email exists, a reset code has been sent',
            email,
        };
    }

    async verifyPasswordResetCode(body: PspVerifyResetCodeDto) {
        const { code } = body;
        const pspId = await this.cacheService.get(
            CacheKeys.PspResetPasswordCode(code),
        );
        const pspMember = await this.pspMemberModel.findById(pspId);

        if (!pspMember) {
            throw new BadRequestException('Invalid or expired reset code');
        }

        const secret = this.configService.get('jwt.secret', { infer: true });
        const token = jwt.sign(
            {
                id: pspMember._id,
                email: pspMember.email,
            },
            secret,
            { expiresIn: '7d' },
        );

        return { token };
    }

    async resetPassword(pspId: string, body: PspResetPasswordDto) {
        if (body.password !== body.confirmPassword || body.password.length < 6)
            throw new BadRequestException('Passwords do not match or are too short');

        await this.pspMemberModel.updateOne(
            { _id: pspId },
            { $set: { password: body.password } },
        );

        return { message: 'Password reset successful' };
    }

    async getPspMemberDetailsByToken(token: string) {
        const decoded = this.jwtService.verify(token);

        const pspMember = await this.pspMemberModel.findById(decoded.id);
        if (!pspMember) {
            return null;
        }

        return pspMember;
    }

    async logout(token: string) {
        const tokenDetails = await this.jwtService.decode(token);

        const ttl = tokenDetails.exp - Math.floor(Date.now() / 1000);

        await this.cacheService.set(`blacklist:${token}`, true, ttl);

        return { message: 'Logged out successfully' };
    }
}
