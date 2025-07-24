import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {
  FacilityManager,
  FacilityManagerDocument,
} from '@models/users/facility-manager.model';
import { Payer, PayerDocument } from '@models/users/payer.model';
import {
  MailNotificationEvents,
  SendEmailEvent,
} from '@src/notification/dto/event';
import { EventEmitter2 } from '@nestjs/event-emitter';
// import {
//   sendConfirmationMail,
//   sendLoginCodeEmail,
//   sendResetEmail,
// } from '@utils/mailer';

@Injectable()
export class FacilityManagerService {
  constructor(
    @InjectModel(FacilityManager.name)
    private facilityModel: Model<FacilityManagerDocument>,
    @InjectModel(Payer.name) private payerModel: Model<PayerDocument>,
    private ee: EventEmitter2,
  ) {}

  async register(dto: {
    payerId: string;
    password: string;
    confirmPassword: string;
    organizationName: string;
    phoneNumber: string;
  }) {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const manager = await this.facilityModel.create({
      payerId,
      organizationName,
      phoneNumber,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: hashedPassword,
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

  async login(dto: { email: string; password: string }) {
    const manager = await this.facilityModel.findOne({ email: dto.email });
    if (!manager) throw new NotFoundException('Manager not found');

    const valid = await bcrypt.compare(dto.password, manager.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    manager.loginCode = code;
    manager.loginCodeExpires = expires;
    await manager.save();

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

  async verifyLoginCode(id: string, code: string) {
    const manager = await this.facilityModel.findOne({
      _id: id,
      loginCode: code,
      loginCodeExpires: { $gt: new Date() },
    });
    if (!manager) throw new BadRequestException('Invalid or expired code');

    manager.loginCode = undefined;
    manager.loginCodeExpires = undefined;
    await manager.save();

    const token = jwt.sign(
      {
        id: manager._id,
        payerId: manager.payerId,
        email: manager.email,
        role: 'Facility',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    const data = manager.toObject();
    delete data.password;
    delete data.loginCode;
    delete data.loginCodeExpires;

    return { message: 'Login successful', token, manager: data };
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
      .select('firstName lastName profilePicture');
    if (!manager) throw new NotFoundException('Manager not found');

    return {
      fullName: `${manager.firstName} ${manager.lastName}`,
      profilePicture:
        manager.profilePicture ||
        'https://res.cloudinary.com/demo/image/upload/avatar.png',
    };
  }

  async requestPasswordReset(email: string) {
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    const resetTokenExpiry = new Date(Date.now() + 20 * 60 * 1000);

    const manager = await this.facilityModel.findOneAndUpdate(
      { email },
      { $set: { resetToken: resetCode, resetTokenExpiry } },
      { new: false },
    );

    if (manager) {
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
    // await sendResetEmail(manager.email, manager.firstName, resetCode);

    return { message: 'If account exists, reset code sent', email };
  }

  async verifyResetCode(code: string) {
    const manager = await this.facilityModel.findOne({
      resetToken: code,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!manager)
      throw new BadRequestException('Invalid or expired reset code');

    return { message: 'Reset code verified', id: manager._id };
  }

  async resetPassword(
    userId: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword || newPassword.length < 6)
      throw new BadRequestException('Passwords do not match or are too short');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.facilityModel.updateOne(
      { _id: userId },
      { $set: { password: hashed, resetToken: null, resetTokenExpiry: null } },
    );

    return { message: 'Password reset successful' };
  }

  logout() {
    return { message: 'Logged out successfully' };
  }
}
