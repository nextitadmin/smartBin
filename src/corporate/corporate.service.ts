import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { Corporate, CorporateDocument } from '@models/users/corporate.model';
import { comparePassword, generateOtpCode } from '@common/utils';
import {
  MailNotificationEvents,
  SendEmailEvent,
} from '@src/notification/dto/event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';

import {
  CorporateLoginDto,
  CreateCorporateAccountDto,
  VerifyCorporateLogin,
  CorporateForgotPasswordDto,
  CorporateVerifyResetCodeDto,
  ResetPasswordDto,
  ProfileDto,
  CreateApplicationDto,
  GetApplicationParamDto,
} from './dto/corporate.dto';
import { Payer, PayerDocument } from '@models/users/payer.model';
import { CacheKeys } from '@src/shared/constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserRole } from '@models/types';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';
import { SmartBin } from '@models/smart-bin.model';
import { ConfigService } from '@nestjs/config';
import { UserKyc } from '@models/user-kyc.model';

@Injectable()
export class CorporateService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    @InjectModel(Corporate.name)
    private corporateModel: Model<CorporateDocument>,
    @InjectModel(Payer.name) private readonly payerModel: Model<PayerDocument>,
    @InjectModel(UserKyc.name) private userKycModel: Model<UserKyc>,
    private ee: EventEmitter2,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(SmartBin.name) private readonly smartBinService: SmartBinService,
  ) { }

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

    const newBusiness = await this.corporateModel.create({
      payerId,
      businessName,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: password,
      phoneNumber: payer.phoneNumber,
    });

     await this.userKycModel.create({
      userId: newBusiness._id,
      userType: UserRole.Corporate,
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
    const isPasswordMatch = comparePassword(password, business.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const loginCode = Math.floor(10000 + Math.random() * 90000).toString();
    const loginCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

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

  async updateProfilePicture(userId: string, filePath: string) {
    const business = await this.corporateModel.findById(userId);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    business.profilePicture = filePath;
    await business.save();

    return {
      message: 'Profile picture updated successfully',
      profilePicture: business.profilePicture,
    };
  }

  async getProfile(userId: string) {
    console.log("hereagain.....")
    const business = await this.corporateModel
      .findById(userId)
      .select('-password -loginCode -loginCodeExpires')
      .lean();
    if (!business) {
      throw new NotFoundException('Corporate business not found');
    }

    const userKyc = await this.userKycModel.findOne({ userId: new Types.ObjectId(userId) }).lean();
    const defaultAvatar =
      'https://res.cloudinary.com/demo/image/upload/avatar.png';

    const data = {
      businessName: business.businessName || null,
      payerId: business.payerId || null,
      fullName: `${business.firstName} ${business.lastName}` || null,
      email: business.email || null,
      address: userKyc.address || null,
      landmark: userKyc.closestLandmark || null,
      nextPickupDate: null,
      accountNumber:  null,
      localGovermentArea: userKyc.localGovernment || null,
      buildingType: userKyc.buildingType || null,
    };
    return {
      message: 'Corporate profile retrieved successfully',
      ...business,
      ...data,
      phoneNumber: business.phoneNumber || null,
      profilePicture: business.profilePicture || defaultAvatar,
    };
  }


  async requestPasswordReset(body: CorporateForgotPasswordDto) {
    const { email } = body;
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    const expiry = 600000;

    const business = await this.corporateModel.findOne({ email });
    if (business) {
      await this.cacheService.set(
        CacheKeys.CorporateLoginCode(String(resetCode)),
        String(business._id),
        expiry,
      );
      this.ee.emit(
        MailNotificationEvents.Account.ForgotPassword,
        new SendEmailEvent({
          to: business.email,
          from: `"LAWMA REG" <accounts@lawma.co>`,
          subject: 'Password Reset Request',
          context: {
            firstName: business.businessName,
            resetCode,
          },
        }),
      );
    }
    return { message: 'If account exists, a reset email will be sent' };
  }

  async verifyPasswordResetCode(dto: CorporateVerifyResetCodeDto) {
    const { code } = dto;
    const businessId = await this.cacheService.get(
      CacheKeys.CorporateLoginCode(code),
    );

    const business = await this.corporateModel.findById(businessId)
    if (!business) {
      throw new BadRequestException('Invalid Or Expired Reset Code');
    }

    const secret = this.configService.get('jwt.secret', { infer: true });
    const token = jwt.sign(
      {
        id: business._id,
        role: UserRole.Corporate,
        payerId: business.payerId,
        email: business.email,
      },
      secret,
      { expiresIn: '7d' },
    );
    return { token };
  }
  async resetPassword(userId: string, body: ResetPasswordDto) {
    if (body.password !== body.confirmPassword || body.password.length < 6)
      throw new BadRequestException('Passwords do not match or are too short');

    await this.corporateModel.updateOne(
      { _id: userId },
      { $set: { password: body.password } },
    );

    return { message: 'Password reset successful' };
  }

  async logout(token: string) {
    const tokenDetails = await this.jwtService.decode(token);

    const ttl = tokenDetails.exp - Math.floor(Date.now() / 1000);

    await this.cacheService.set(`blacklist:${token}`, true, ttl);

    return { message: 'Logged out successfully' };
  }

  public async getDashboardDetails(userId: string) {
    const business = await this.corporateModel
      .findById(userId)
      .select('payerId firstName lastName address role')
      .lean();
    const smartBinCount = await this.corporateModel.find({
      userId: business._id,
      customerType: UserRole.Corporate,
    });

    const data = {
      smartBinApplicationCount: smartBinCount || 0,
      name: `${business.firstName} ${business.lastName}`,
      role: business.role,
      address: business[0]?.address || 'N/A',
      payerId: business.payerId,
      userId: business._id,
      totalOutstandingBill: 24000,
      avaliableBalance: 50000,
      estimatedAnnualSubscriptionFee: 0,
      nextPickUpDate: 'N/A',
    };

    return {
      message: 'Business Dashboard details retrived successfully',
      data,
    };
  }


  async getDetailsByToken(token: string) {
    const tokenDetails = await this.jwtService.decode(token);
    if (!tokenDetails) {
      throw new UnauthorizedException('unable to unauthenticate');
    }
    return this.getProfile(tokenDetails.id);
  }
}