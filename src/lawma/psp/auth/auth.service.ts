import { comparePassword } from "@common/utils";
import { PSP } from "@models/psp.model";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import * as jwt from 'jsonwebtoken';
import { InjectModel } from "@nestjs/mongoose";
import { CacheKeys } from "@src/shared/constants";
import { Cache } from "cache-manager"
import { Model } from "mongoose";
import { PspForgotPasswordDto, PspLoginDto, PspResetPasswordDto, PspVerifyResetCodeDto } from "../dto/psp.dto";
import { MailNotificationEvents, SendEmailEvent } from "@src/notification/dto/event";
import { ApplicationEnvironment } from "@common/constants";

@Injectable()
export class PspAuthService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheService: Cache,
        @InjectModel(PSP.name) private readonly pspModel: Model<PSP>,
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

        const psp = await this.pspModel.findOne({ administrator_email: email });

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
                to: String(psp.administrator_email),
                from: `"LAWMA REG" <no-reply@resend.dev>`,
                subject: 'Your Login Verification Code',
                context: {
                    firstName: psp.administrator_name,
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

        const pspAdmin = await this.pspModel
            .findOne({
                _id: pspId,
            })
            .select('-password')
            .lean();

        if (!pspAdmin) {
            throw new BadRequestException('Invalid or expired login code');
        }
        const secret = String(this.configService.get<string>('JWT_SECRET'));
        const token = jwt.sign(
            {
                id: pspAdmin._id,
                email: pspAdmin.administrator_email,
            },
            secret,
            { expiresIn: '7d' },
        );

        return { message: 'Login successful', token, data: pspAdmin };
    }

    async requestPasswordReset(body: PspForgotPasswordDto) {
        const { email } = body;
        const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
        const expiry = 600000;

        const psp = await this.pspModel.findOne({ administrator_email: email });
        if (psp) {
            await this.cacheService.set(
                CacheKeys.PspResetPasswordCode(String(resetCode)),
                String(psp._id),
                expiry,
            );
            this.ee.emit(
                MailNotificationEvents.Account.ForgotPassword,
                new SendEmailEvent({
                    to: psp.administrator_email,
                    from: `"LAWMA REG" <accounts@lawma.co>`,
                    subject: 'Password Reset Request',
                    context: {
                        firstName: psp.administrator_name,
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
        const psp = await this.pspModel.findById(pspId);

        if (!psp) {
            throw new BadRequestException('Invalid or expired reset code');
        }

        const secret = this.configService.get('jwt.secret', { infer: true });
        const token = jwt.sign(
            {
                id: psp._id,
                email: psp.administrator_email,
            },
            secret,
            { expiresIn: '7d' },
        );

        return { token };
    }

    async resetPassword(pspId: string, body: PspResetPasswordDto) {
        if (body.password !== body.confirmPassword || body.password.length < 6)
            throw new BadRequestException('Passwords do not match or are too short');

        await this.pspModel.updateOne(
            { _id: pspId },
            { $set: { password: body.password } },
        );

        return { message: 'Password reset successful' };
    }

    async getAdminDetailsByToken(token: string) {
        const decoded = this.jwtService.verify(token);

        const pspAdmin = await this.pspModel.findById(decoded.id);
        if (!pspAdmin) {
            return null;
        }

        return pspAdmin;
    }

    async logout(token: string) {
        const tokenDetails = await this.jwtService.decode(token);

        const ttl = tokenDetails.exp - Math.floor(Date.now() / 1000);

        await this.cacheService.set(`blacklist:${token}`, true, ttl);

        return { message: 'Logged out successfully' };
    }
}