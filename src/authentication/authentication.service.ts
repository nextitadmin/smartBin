import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { Customer } from '../models/customer.model';
import { InjectModel } from '@nestjs/mongoose';
import {
  comparePassword,
  getCustomerToken,
  getHashedPassword,
} from '../common/utils';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { cacheKeys, events } from '@common/constants';
// import { KycUpgradedEvent } from '@src/kyc/kyc.event';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthenticationService {
  // constructor(
  //   @Inject(CACHE_MANAGER) private cacheService: Cache,
  //   @InjectModel(Customer.name) private customerModel: Model<Customer>,
  //   private jwtService: JwtService,
  //   private readonly customerService: CustomerService,
  //   private ee: EventEmitter2,
  // ) {}
  // private logger = new Logger(AuthenticationService.name);
  // async login({ email, passcode }: { email: string; passcode: string }) {
  //   throw new BadRequestException('Service is currently under maintenance. Please check back later.')
  //   // Validate user
  //   const customer = await this.customerModel.findOne({
  //     email,
  //   });
  //   if (!customer) {
  //     this.logger.error('Invalid email');
  //     throw new UnauthorizedException('Invalid Customer Details');
  //   }
  //   // Validate passcode
  //   const validPasscode = comparePassword(passcode, customer.passcode);
  //   if (!validPasscode) {
  //     this.logger.error('Invalid passcode');
  //     throw new UnauthorizedException('Invalid Customer Details');
  //   }
  //   const access_token = getCustomerToken(customer, this.jwtService);
  //   this.ee.emit(
  //     events.kyc.upgraded,
  //     new KycUpgradedEvent({
  //       customer_id: String(customer._id),
  //       bvn: Math.floor(Math.random() * 1000000000).toString(),
  //       tier: KycTier.One,
  //     }),
  //   );
  //   return {
  //     access_token,
  //   };
  // }
  // async forgotPasscode({ email }: { email: string }) {
  //   const customer = await this.customerModel
  //     .findOne({
  //       email,
  //     })
  //     .lean();
  //   if (!customer) {
  //     this.logger.error('Invalid email');
  //     throw new UnauthorizedException('Invalid Customer Details');
  //   }
  //   // Send OTP reset.
  //   const resetToken = getCustomerToken(
  //     {
  //       ...customer,
  //       accessType: 'reset',
  //     },
  //     this.jwtService,
  //   );
  //   await this.customerService.sendOtpCode({
  //     id: String(customer._id),
  //     first_name: customer.first_name,
  //     email: customer.email,
  //     isResetPassword: true,
  //     token: resetToken,
  //   });
  //   return {
  //     nextAction: 'confirm-email',
  //   };
  // }
  // async validateResetToken({ token }: { token: string }) {
  //   try {
  //     const validToken = await this.jwtService.verify(token);
  //     if (!validToken) {
  //       throw new BadRequestException('Invalid token');
  //     }
  //   } catch (error) {
  //     if (error.name === 'TokenExpiredError') {
  //       throw new BadRequestException('Reset link has expired!');
  //     }
  //   }
  // }
  // async updatePasscode({
  //   token,
  //   newPasscode,
  // }: {
  //   token: string;
  //   newPasscode: string;
  // }) {
  //   const validToken = await this.jwtService.verify(token);
  //   if (!validToken) {
  //     throw new BadRequestException(
  //       'Oops! Looks like your link has expired! Please initiate again!',
  //     );
  //   }
  //   const otpCodeFromCache = (await this.cacheService.get(
  //     cacheKeys.otp(validToken.email),
  //   )) as any;
  //   if (!otpCodeFromCache) {
  //     throw new BadRequestException(
  //       'Oops! Looks like your link has expired! Please initiate again!',
  //     );
  //   }
  //   const customerDetails = await this.customerModel.findOne({
  //     email: validToken.email,
  //   });
  //   customerDetails.passcode = getHashedPassword(newPasscode);
  //   await customerDetails.save();
  //   await this.cacheService.del(cacheKeys.otp(validToken.email));
  //   return { nextAction: 'login' };
  // }
}
