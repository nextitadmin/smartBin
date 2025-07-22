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
import { Agent, AgentDocument } from '@models/users/agent.model';
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
import { CreateAgentAccountDto, LoginAgentAccountDto } from './dto/agent.dto';

const JWT_SECRET = process.env.JWT_SECRET;

@Injectable()
export class AgentService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly jwtService: JwtService,
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
    @InjectModel(Payer.name) private readonly payerModel: Model<PayerDocument>,
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
      payerId,
      agencyName,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      password: hashedPassword,
    });

    await sendConfirmationMail(newAgent.email, newAgent.firstName);

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
    const loginCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    agent.loginCode = loginCode;
    agent.loginCodeExpiry = loginCodeExpiry;
    await agent.save();

    const ttlSeconds = getSeconds(loginCodeExpiry);
    await this.cacheService.set(
      CacheKeys.AgentLoginCode(String(loginCode)),
      String(agent._id),
      ttlSeconds,
    );

    await sendLoginCodeEmail(agent.email, agent.firstName, loginCode);
  }

  async verifyLoginCode(loginCode: string) {
    const verificationCode = await this.cacheService.get(
      CacheKeys.AgentLoginCode(loginCode),
    );

    if (!verificationCode) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    const agent = await this.agentModel
      .findOne({
        _id: verificationCode,
        loginCode,
        loginCodeExpiry: { $gt: Date.now() },
      })
      .select('-password')
      .lean();

    if (!agent) {
      throw new BadRequestException('Invalid or expired login code');
    }

    const token = jwt.sign(
      {
        id: agent._id,
        role: UserRole.Agent,
        payerId: agent.payerId,
        email: agent.email,
      },
      JWT_SECRET,
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
      .select('-password -createdAt -updatedAt')
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
      await sendResetEmail(agent.email, agent.firstName, resetCode);
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
    await this.agentModel.updateOne(
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
