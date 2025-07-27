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
import * as jwt from 'jsonwebtoken';
import { Resident, ResidentDocument } from '@models/users/resident.model';
import { Payer, PayerDocument } from '@models/users/payer.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MailNotificationEvents,
  SendEmailEvent,
} from '@src/notification/dto/event';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKeys } from '@src/shared/constants';
import { UserRole } from '@models/types';
import { JwtService } from '@nestjs/jwt';
import {
  CreateResidentAccountDto,
  ResidentLoginDto,
  ResidentVerifyResetCodeDto,
  ResidentForgotPasswordDto,
  CreateApplicationDto,
  ResetPasswordDto,
} from './dto/resident.dto';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';
import { date } from 'joi';
import { SmartBin } from '@models/smart-bin.model';
import { comparePassword } from '@common/utils';

@Injectable()
export class ResidentService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly configService: ConfigService,
    private readonly smartBinService: SmartBinService,
    private readonly jwtService: JwtService,
    @InjectModel(Resident.name)
    private readonly residentModel: Model<ResidentDocument>,
    @InjectModel(Payer.name) private readonly payerModel: Model<PayerDocument>,
    @InjectModel(SmartBin.name) private readonly smartBinModel: Model<SmartBin>,
    private ee: EventEmitter2,
  ) {}

  async registerResident(body: CreateResidentAccountDto) {
    const { payerId, password, confirmPassword } = body;

    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    const existing = await this.residentModel.findOne({ payerId });
    if (existing) {
      throw new ConflictException(
        'Resident already registered with this payerId',
      );
    }

    const payer = await this.payerModel.findOne({ payerId });
    if (!payer) {
      throw new NotFoundException('Invalid payerId');
    }

    const newResident = await this.residentModel.create({
      payerId,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: password,
      phoneNumber: payer.phoneNumber,
    });

    this.ee.emit(
      MailNotificationEvents.Account.Welcome,
      new SendEmailEvent({
        to: payer.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'Registration Successful',
        context: {
          firstName: newResident.firstName,
        },
      }),
    );

    return {
      message: 'Resident registered successfully',
      data: {
        id: newResident._id,
        payerId: newResident.payerId,
        fullName: `${newResident.firstName} ${newResident.lastName}`,
        email: newResident.email,
        phoneNumber: newResident.phoneNumber,
      },
    };
  }

  async login(body: ResidentLoginDto) {
    const { email, password } = body;

    const resident = await this.residentModel.findOne({ email });
    if (!resident) {
      throw new NotFoundException('Resident not found');
    }

    const isPasswordMatch = comparePassword(password, resident.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const loginCode = Math.floor(10000 + Math.random() * 90000).toString();
    const loginCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    resident.loginCode = loginCode;
    resident.loginCodeExpiry = loginCodeExpiry;
    await resident.save();
    await this.cacheService.set(
      CacheKeys.ResidentLoginCode(String(loginCode)),
      String(resident._id),
    );
    this.ee.emit(
      MailNotificationEvents.Account.VerificationOTP,
      new SendEmailEvent({
        to: String(resident.email),
        from: `"LAWMA REG" <no-reply@resend.dev>`,
        subject: 'Your Login Verification Code',
        context: {
          firstName: resident.firstName,
          loginCode,
        },
      }),
    );
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
    const secret = String(this.configService.get<string>('JWT_SECRET'));
    const token = jwt.sign(
      {
        id: resident._id,
        role: UserRole.Resident,
        payerId: resident.payerId,
        email: resident.email,
      },
      secret,
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
      .select(
        'firstName lastName email profilePicture payerId landmark nextPickupDate accountNo localGovermentArea buildingType profilePicture phoneNumber nationality gender lawmaCustomerType address role',
      )
      .lean();

    if (!resident) {
      throw new NotFoundException('Resident not found');
    }

    const defaultAvatar =
      'https://res.cloudinary.com/demo/image/upload/avatar.png';

    const data = {
      address: resident.address || null,
      landmark: resident.landmark || null,
      nextPickupDate: resident.nextPickupDate || null,
      accountNumber: resident.accountNo || null,
      localGovermentArea: resident.localGovermentArea || null,
      buildingType: resident.buildingType || null,
    };
    return {
      ...resident,
      ...data,
      phoneNumber: resident.phoneNumber || null,
      profilePicture: resident.profilePicture || defaultAvatar,
    };
  }

  async requestPasswordReset(body: ResidentForgotPasswordDto) {
    const { email } = body;
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    const resetTokenExpiry = new Date(Date.now() + 20 * 60 * 1000);
    const expiry = 600000;

    const resident = await this.residentModel.findOne({ email });
    if (resident) {
      await this.cacheService.set(
        CacheKeys.ResidentLoginCode(String(resetCode)),
        String(resident._id),
        expiry,
      );
      this.ee.emit(
        MailNotificationEvents.Account.ForgotPassword,
        new SendEmailEvent({
          to: resident.email,
          from: `"LAWMA REG" <accounts@lawma.co>`,
          subject: 'Password Reset Request',
          context: {
            firstName: resident.firstName,
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

  async verifyPasswordResetCode(body: ResidentVerifyResetCodeDto) {
    const { code } = body;
    const residentId = await this.cacheService.get(
      CacheKeys.ResidentLoginCode(code),
    );
    const resident = await this.residentModel.findById(residentId);

    if (!resident) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const secret = this.configService.get('jwt.secret', { infer: true });
    const token = jwt.sign(
      {
        id: resident._id,
        role: UserRole.Resident,
        payerId: resident.payerId,
        email: resident.email,
      },
      secret,
      { expiresIn: '7d' },
    );

    return { token };
  }

  async resetPassword(userId: string, body: ResetPasswordDto) {
    if (body.password !== body.confirmPassword || body.password.length < 6)
      throw new BadRequestException('Passwords do not match or are too short');

    await this.residentModel.updateOne(
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

  async getResidentDetailsByToken(token: string) {
    const tokenDetails = await this.jwtService.decode(token);
    if (!tokenDetails) {
      throw new UnauthorizedException('unable to unauthenticate');
    }

    return this.getProfile(tokenDetails.id);
  }

  public async getDashboardDetails(userId: string) {
    const resident = await this.residentModel
      .findById(userId)
      .select('payerId firstName lastName address role')
      .lean();
    const smartBinCount = await this.smartBinModel.find({
      userId: resident._id,
      customerType: UserRole.Resident,
    });

    const data = {
      smartBinApplicationCount: smartBinCount || 0,
      name: `${resident.firstName} ${resident.lastName}`,
      role: resident.role,
      address: resident.address || null,
      payerId: resident.payerId,
      userId: resident._id,
      totalOutstandingBill: 24000,
      avaliableBalance: 50000,
      estimatedAnnualSubscriptionFee: 0,
      nextPickUpDate: 'N/A',
    };

    return {
      message: 'Resident Dashboard details retrived successfully',
      data,
    };
  }

  async createBinApplication(
    body: CreateApplicationDto & { residentId: string },
  ) {
    const data = await this.smartBinService.createBinApplication({
      accountId: body.residentId,
      accountType: UserRole.Resident,
      applicationData: body,
    });
    return data;
  }

  async getAllResidentApplications(userId: string, role: string) {
    const data = await this.smartBinService.getBinApplicationsByUserId(
      userId,
      role,
    );
    return data;
  }

  async getApplicationDetails(applicationId: string) {
    const data = await this.smartBinService.getBinApplicationDetails(
      applicationId,
    );
    return data;
  }
}
