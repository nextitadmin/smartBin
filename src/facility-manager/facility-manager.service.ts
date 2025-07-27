import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {
  defaultManagerFields,
  FacilityManager,
  FacilityManagerDocument,
} from '@models/users/facility-manager.model';
import { Payer, PayerDocument } from '@models/users/payer.model';
import {
  MailNotificationEvents,
  SendEmailEvent,
} from '@src/notification/dto/event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateManagerAccountDto,
  LoginManagerAccountDto,
} from './dto/facility-manager.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKeys } from '@src/shared/constants';
import { UserRole } from '@models/types';
import { defaultAgentFields } from '@models/users/agent.model';
import { ConfigAttributes } from '@src/config';
import { ConfigService } from '@nestjs/config';
import { comparePassword } from '@common/utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class FacilityManagerService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    @InjectModel(FacilityManager.name)
    private facilityModel: Model<FacilityManagerDocument>,
    @InjectModel(Payer.name) private payerModel: Model<PayerDocument>,
    private readonly configService: ConfigService<ConfigAttributes>,
    private readonly jwtService: JwtService,
    private ee: EventEmitter2,
  ) {}

  async register(dto: CreateManagerAccountDto) {
    const {
      payerId,
      password,
      confirmPassword,
      organizationName,
      phoneNumber,
    } = dto;

    if (password !== confirmPassword)
      throw new BadRequestException('Passwords do not match');

    const existing = await this.facilityModel.findOne({ payerId });
    if (existing)
      throw new BadRequestException('Already registered with this payerId');

    const payer = await this.payerModel.findOne({ payerId });
    if (!payer) throw new NotFoundException('Invalid payerId');

    const manager = await this.facilityModel.create({
      payerId,
      organizationName,
      phoneNumber,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: password,
    });

    this.ee.emit(
      MailNotificationEvents.Account.Welcome,
      new SendEmailEvent({
        to: payer.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'Registration Successful',
        context: {
          firstName: payer.firstName,
          // loginCode,
        },
      }),
    );
    // await sendConfirmationMail(manager.email, manager.firstName);

    return {
      message: 'Facility manager registered successfully',
      manager: {
        id: manager._id,
        payerId: manager.payerId,
        fullName: `${manager.firstName} ${manager.lastName}`,
        email: manager.email,
        organizationName: manager.organizationName,
        phoneNumber: manager.phoneNumber,
      },
    };
  }

  async login(dto: LoginManagerAccountDto) {
    const manager = await this.facilityModel.findOne({ email: dto.email });
    if (!manager) throw new NotFoundException('Manager not found');

    const valid = comparePassword(dto.password, manager.password);

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expires = 600000; // 10mins

    console.log({ code });

    await this.cacheService.set(
      CacheKeys.FacilityManagerLoginCode(String(code)),
      String(manager._id),
      expires,
    );

    this.ee.emit(
      MailNotificationEvents.Account.VerificationOTP,
      new SendEmailEvent({
        to: manager.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'Your Login Verification Code',
        context: {
          firstName: manager.firstName,
          loginCode: code,
        },
      }),
    );
    // await sendLoginCodeEmail(manager.email, manager.firstName, code);

    return {
      message: 'Verification code sent to email',
      email: manager.email,
      id: manager._id,
    };
  }

  async verifyLoginCode(code: string) {
    const managerId = await this.cacheService.get(
      CacheKeys.FacilityManagerLoginCode(code),
    );

    const manager = await this.facilityModel
      .findById(managerId)
      .select(defaultManagerFields);
    if (!manager) {
      throw new BadRequestException('Invalid or expired code');
    }

    const token = jwt.sign(
      {
        id: manager._id,
        payerId: manager.payerId,
        email: manager.email,
        role: UserRole.Facility,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    return { token, manager };
  }

  async updateProfilePicture(userId: string, fileUrl: string) {
    const manager = await this.facilityModel.findById(userId);
    if (!manager) throw new NotFoundException('Manager not found');

    manager.profilePicture = fileUrl;
    await manager.save();
    return { message: 'Profile picture updated', profilePicture: fileUrl };
  }

  async getProfile(userId: string) {
    const manager = await this.facilityModel
      .findById(userId)
      .select('_id firstName lastName profilePicture email');
    if (!manager) throw new NotFoundException('Manager not found');

    return {
      _id: manager._id,
      email: manager.email,
      fullName: `${manager.firstName} ${manager.lastName}`,
      profilePicture:
        manager.profilePicture ||
        'https://res.cloudinary.com/demo/image/upload/avatar.png',
    };
  }

  async requestPasswordReset(email: string) {
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    const expiry = 600000;


    const manager = await this.facilityModel.findOne({ email });
    if (manager) {
      await this.cacheService.set(
        CacheKeys.FacilityManagerLoginCode(String(resetCode)),
        String(manager._id),
        expiry,
      );
      this.ee.emit(
        MailNotificationEvents.Account.ForgotPassword,
        new SendEmailEvent({
          to: manager.email,
          from: `"LAWMA REG" <accounts@lawma.co>`,
          subject: 'Password Reset Request',
          context: {
            firstName: manager.firstName,
            resetCode,
          },
        }),
      );
    }
    return {
      message:
        'If an account with that email exists, a reset code has been sent',
    };
  }

  async verifyResetCode(code: string) {
    const managerId = await this.cacheService.get(
      CacheKeys.FacilityManagerLoginCode(code),
    );
    const manager = await this.facilityModel.findById(managerId);
    if (!manager) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const secret = this.configService.get('jwt.secret', { infer: true });
    const token = jwt.sign(
      {
        id: manager._id,
        role: UserRole.Facility,
        payerId: manager.payerId,
        email: manager.email,
      },
      secret,
      { expiresIn: '7d' },
    );

    return { token };
  }

  async completePasswordReset(
    userId: string,
    param: { newPassword: string; confirmPassword: string },
  ) {

    if (
      param.newPassword !== param.confirmPassword ||
      param.newPassword.length < 6
    )
      throw new BadRequestException('Passwords do not match or are too short');

    await this.facilityModel.updateOne(
      { _id: userId },
      { $set: { password: param.newPassword } },
    );

    return { message: 'Password reset successful' };
  }

  public async getFacilityManagerDetailsByToken(token: string) {
    const tokenDetails = await this.jwtService.decode(token);
    if (!tokenDetails) {
      throw new UnauthorizedException('unable to unauthenticate');
    }

    return this.getProfile(tokenDetails.id);
  }

  logout(id) {
    return { message: 'Logged out successfully' };
  }
}
