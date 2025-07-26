import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  Inject,
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
import * as jwt from 'jsonwebtoken';
import {
  CorporateLoginDto,
  CreateCorporateAccountDto,
} from './dto/corporate.dto';
import { Payer, PayerDocument } from '@models/users/payer.model';
import { CacheKeys } from '@src/shared/constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserRole } from '@models/types';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorporateService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheService: Cache,
    @InjectModel(Corporate.name)
    private corporateModel: Model<CorporateDocument>,
    @InjectModel(Payer.name)
    private readonly payerModel: Model<PayerDocument>,
    private ee: EventEmitter2,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly smartBinService: SmartBinService,

  ) {}

  async registerCorporate(body: CreateCorporateAccountDto) {
    const { password, payerId, businessName, confirmPassword } = body;

    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    const existing = await this.corporateModel.findOne({ payerId });
    if (existing) {
      throw new ConflictException(
        'Business Corporate already registered with this payerId',
      );
    }

    const payer = await this.payerModel.findOne({ payerId });

    if (!payer) {
      throw new NotFoundException('Invalid payerId');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newBusiness = await this.corporateModel.create({
      payerId,
      businessName,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: hashedPassword,
      phoneNumber: payer.phoneNumber,
    });

    this.ee.emit(
      MailNotificationEvents.Account.Welcome,
      new SendEmailEvent({
        to: payer.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'Corporate Registration Successful',
        context: {
          firstName: newBusiness.businessName,
        },
      }),
    );

    return {
      message: 'Corporate registered successfully',
      data: {
        id: newBusiness._id,
        businessName: newBusiness.businessName,
        payerId: newBusiness.payerId,
        fullName: `${newBusiness.firstName} ${newBusiness.lastName}`,
        email: newBusiness.email,
        phoneNumber: newBusiness.phoneNumber,
      },
    };
  }

  async loginCorporate(body: CorporateLoginDto) {
    const { email, password } = body;

    const business = await this.corporateModel.findOne({ email: email });
    if (!business) {
      throw new NotFoundException('Corporate business does not exist');
    }
    const isPasswordMatch = await bcrypt.compare(password, business.password);

    if (!business) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const loginCode = Math.floor(10000 + Math.random() * 90000).toString();
    const loginCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    console.log(loginCode);

    business.loginCode = loginCode;
    business.loginCodeExpiry = loginCodeExpiry;
    await business.save();

    await this.cacheService.set(
      CacheKeys.CorporateLoginCode(String(loginCode)),
      String(business._id),
    );
    this.ee.emit(
      MailNotificationEvents.Account.VerificationOTP,
      new SendEmailEvent({
        to: String(business.email),
        from: `"LAWMA REG" <no-reply@resend.dev>`,
        subject: 'Your Login Verification Code',
        context: {
          firstName: business.businessName,
          loginCode,
        },
      }),
    );
  }

  async verifyLoginCode(loginCode: string) {
    const verificationCode = await this.cacheService.get(
      CacheKeys.CorporateLoginCode(loginCode),
    );

    if (!verificationCode) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    const business = await this.corporateModel
      .findOne({
        _id: verificationCode,
        loginCode,
        loginCodeExpiry: { $gt: Date.now() },
      })
      .select('-password')
      .lean();

    if (!business) {
      throw new BadRequestException('Invalid or expired login code');
    }
    const secret = String(this.configService.get<string>('JWT_SECRET'));
    const token = jwt.sign(
      {
        id: business._id,
        role: UserRole.Corporate,
        payerId: business.payerId,
        email: business.email,
        businessName: business.businessName
      },
      secret,
      { expiresIn: '7d' },
    );

    return { message: 'Login successful', token, data: business };
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
