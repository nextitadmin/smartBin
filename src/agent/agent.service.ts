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
import {
  Agent,
  AgentDocument,
  defaultAgentFields,
} from '@models/users/agent.model';
import { Payer, PayerDocument } from '@models/users/payer.model';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKeys } from '@src/shared/constants';
import { getSeconds } from 'date-fns';
import { UserRole } from '@models/types';
import { JwtService } from '@nestjs/jwt';
import { CreateAgentAccountDto, LoginAgentAccountDto } from './dto/agent.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MailNotificationEvents,
  SendEmailEvent,
} from '@src/notification/dto/event';

@Injectable()
export class AgentService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly jwtService: JwtService,
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
    @InjectModel(Payer.name) private readonly payerModel: Model<PayerDocument>,
    private readonly configService: ConfigService,
    private ee: EventEmitter2,
  ) {}

  async registerAgent(body: CreateAgentAccountDto) {
    const { payerId, agencyName, password, confirmPassword } = body;

    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    const existing = await this.agentModel.findOne({ payerId });
    if (existing) {
      throw new ConflictException('Agent already registered with this payerId');
    }

    const payer = await this.payerModel.findOne({ payerId });
    if (!payer) {
      throw new NotFoundException('Invalid payerId');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = await this.agentModel.create({
      payerId: payer._id,
      agencyName,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: hashedPassword,
    });

    this.ee.emit(
      MailNotificationEvents.Account.Welcome,
      new SendEmailEvent({
        to: newAgent.email,
        from: `"LAWMA REG" <accounts@lawma.co>`,
        subject: 'Registration Successful',
        context: {
          firstName: newAgent.firstName,
        },
      }),
    );

    return {
      message: 'Agent registered successfully',
      data: {
        id: newAgent._id,
        payerId: newAgent.payerId,
        fullName: `${newAgent.firstName} ${newAgent.lastName}`,
        email: newAgent.email,
      },
    };
  }

  async login(body: LoginAgentAccountDto) {
    const { email, password } = body;
    console.log(body);
    const agent = await this.agentModel.findOne({ email });
    console.log(agent);
    const isPasswordMatch = await bcrypt.compare(password, agent.password);
    console.log({ isPasswordMatch, password });
    if (!agent) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const loginCode = Math.floor(10000 + Math.random() * 90000).toString();
    const loginCodeExpiry = 600000; // 10mins

    await agent.save();

    console.log('Setting code', loginCode);
    await this.cacheService.set(
      CacheKeys.AgentLoginCode(String(loginCode)),
      String(agent._id),
      loginCodeExpiry,
    );

    this.ee.emit(
      MailNotificationEvents.Account.VerificationOTP,
      new SendEmailEvent({
        to: agent.email,
        from: `"LAWMA REG" <no-reply@resend.dev>`,
        subject: 'Your Login Verification Code',
        context: {
          firstName: agent.firstName,
          loginCode,
        },
      }),
    );
  }

  async verifyLoginCode(loginCode: string) {
    const agentId = await this.cacheService.get(
      CacheKeys.AgentLoginCode(loginCode),
    );

    if (!agentId) {
      throw new BadRequestException('Session expired. Please log in again.');
    }

    const agent = await this.agentModel
      .findOne({
        _id: agentId,
        loginCode,
        loginCodeExpiry: { $gt: Date.now() },
      })
      .select(defaultAgentFields)
      .lean();

    if (!agent) {
      throw new BadRequestException('Invalid or expired login code');
    }
    const secret = this.configService.get<string>('JWT_SECRET');
    const token = jwt.sign(
      {
        id: agent._id,
        role: UserRole.Agent,
        payerId: agent.payerId,
        email: agent.email,
      },
      secret,
      { expiresIn: '7d' },
    );

    return { message: 'Login successful', token, data: agent };
  }

  async updateProfilePicture(userId: string, filePath: string) {
    const agent = await this.agentModel.findById(userId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    agent.profilePicture = filePath;
    await agent.save();

    return {
      message: 'Profile picture updated successfully',
      profilePicture: agent.profilePicture,
    };
  }

  async getProfile(agentId: string) {
    const agent = await this.agentModel
      .findById(agentId)
      .select(defaultAgentFields)
      .lean();
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const defaultAvatar =
      'https://res.cloudinary.com/demo/image/upload/avatar.png';
    return {
      ...agent,
      profilePicture: agent.profilePicture || defaultAvatar,
    };
  }

  async requestPasswordReset(email: string) {
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    const resetTokenExpiry = new Date(Date.now() + 20 * 60 * 1000);

    const agent = await this.agentModel.findOneAndUpdate(
      { email },
      { $set: { resetToken: resetCode, resetTokenExpiry } },
      { new: false },
    );

    if (agent) {
      this.ee.emit(
        MailNotificationEvents.Account.ForgotPassword,
        new SendEmailEvent({
          to: agent.email,
          from: `"LAWMA REG" <accounts@lawma.co>`,
          subject: 'Password Reset Request',
          context: {
            firstName: agent.firstName,
            resetCode,
          },
        }),
      );
      // await sendResetEmail(agent.email, agent.firstName, resetCode);
    }

    return {
      message:
        'If an account with that email exists, a reset code has been sent',
      email,
    };
  }

  async verifyPasswordResetCode(resetCode: string, session: any) {
    const agent = await this.agentModel.findOne({
      resetToken: resetCode,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!agent) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    session.passwordResetUserId = agent._id;
    return { message: 'Code verified. You can now reset your password.' };
  }

  async completePasswordReset(newPassword: string, confirmPassword: string) {
    //   throw new UnauthorizedException(
    //     'Reset session expired. Please verify code again.',
    //   );
    // }
    // if (
    //   !newPassword ||
    //   newPassword !== confirmPassword ||
    //   newPassword.length < 6
    // ) {
    //   throw new BadRequestException('Passwords do not match or are too short');
    // }
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // await this.agentModel.updateOne(
    //   { _id: userId },
    //   {
    //     $set: {
    //       password: hashedPassword,
    //       resetToken: null,
    //       resetTokenExpiry: null,
    //     },
    //   },
    // );
    // session.passwordResetUserId = null;
    // return { message: 'Password has been reset successfully' };
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

  async verifyResetCode(code: string) {}
}
