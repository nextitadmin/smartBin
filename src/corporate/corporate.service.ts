import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Corporate, CorporateDocument } from '@models/users/corporate.model';
import { generateOtpCode } from '@common/utils';
import {
  MailNotificationEvents,
  SendEmailEvent,
} from '@src/notification/dto/event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CorporateService {
  constructor(
    @InjectModel(Corporate.name)
    private corporateModel: Model<CorporateDocument>,
    private ee: EventEmitter2,
    private jwtService: JwtService,
  ) {}

  async registerCorporate(dto: {
    payerId: string;
    businessName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
  }) {
    const { email, payerId } = dto;

    const emailExists = await this.corporateModel.findOne({
      email: email.toLowerCase().trim(),
    });
    if (emailExists) throw new BadRequestException('Email already in use');

    const payerIdExists = await this.corporateModel.findOne({ payerId });
    if (payerIdExists)
      throw new BadRequestException('Payer ID already registered');

    const newCorporate = new this.corporateModel({
      ...dto,
      email: email.toLowerCase(),
      password: await bcrypt.hash(dto.password, 10),
    });

    await newCorporate.save();

    const result = newCorporate.toObject();
    delete result.password;

    return { message: 'Account created successfully', business: result };
  }

  async loginCorporate(dto: { email: string; password: string }) {
    const business = await this.corporateModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (!business) throw new UnauthorizedException('Invalid email or password');

    const match = await bcrypt.compare(dto.password, business.password);
    if (!match) throw new UnauthorizedException('Invalid email or password');

    const otp = String(generateOtpCode());
    business.loginCode = otp;
    business.loginCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await business.save();

    this.ee.emit(
      MailNotificationEvents.Account.VerificationOTP,
      new SendEmailEvent({
        to: business.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'Your Login Verification Code',
        context: {
          firstName: business.businessName,
          loginCode: otp,
        },
      }),
    );
    // await sendOTPEmail(business.email, business.businessName, otp);

    return {
      message: 'OTP sent to email',
      verificationId: business._id,
    };
  }

  async verifyLoginCode(dto: { id: string; code: string }) {
    const business = await this.corporateModel.findById(dto.id);
    if (!business) throw new NotFoundException('User not found');

    if (
      business.loginCode !== dto.code ||
      !business.loginCodeExpires ||
      business.loginCodeExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired code');
    }

    business.loginCode = null;
    business.loginCodeExpires = null;
    await business.save();

    const user = business.toObject();
    delete user.password;

    return {
      message: 'Login successful',
      user,
    };
  }

  async requestPasswordReset(email: string) {
    const business = await this.corporateModel.findOne({
      email: email.toLowerCase(),
    });
    if (!business)
      return { message: 'If account exists, a reset email will be sent' };

    const code = String(generateOtpCode());
    business.resetToken = code;
    business.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    await business.save();

    this.ee.emit(
      MailNotificationEvents.Account.ForgotPassword,
      new SendEmailEvent({
        to: business.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'Password Reset Request',
        context: {
          firstName: business.businessName,
          resetCode: code,
        },
      }),
    );
    // await sendResetEmail(business.email, business.businessName, code);

    return { message: 'If account exists, a reset email will be sent' };
  }

  async resetPassword(dto: {
    email: string;
    code: string;
    newPassword: string;
  }) {
    const business = await this.corporateModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (!business) throw new NotFoundException('User not found');

    if (
      business.resetToken !== dto.code ||
      !business.resetTokenExpires ||
      business.resetTokenExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    business.password = await bcrypt.hash(dto.newPassword, 10);
    business.resetToken = null;
    business.resetTokenExpires = null;
    await business.save();

    return { message: 'Password reset successful' };
  }

  async getProfile(id: string) {
    const business = await this.corporateModel
      .findById(id)
      .select('-password -loginCode -loginCodeExpires');
    if (!business) throw new NotFoundException('User not found');
    return business;
  }

  async getDetailsByToken(token: string) {
    const tokenDetails = await this.jwtService.decode(token);
    if (!tokenDetails) {
      throw new UnauthorizedException('unable to unauthenticate');
    }

    return this.getProfile(tokenDetails.id);
  }
}
