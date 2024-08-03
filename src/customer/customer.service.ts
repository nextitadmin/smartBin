import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  Customer,
  CustomerAttributes,
  CustomerStatus,
} from '../models/customer.model';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailTemplates, cacheKeys, events } from '../common/constants';
import { SendEmailEvent } from '../notification/dto/event';
import {
  compileTemplateWithData,
  generateOtpCode,
  getCustomerToken,
  getHashedPassword,
} from '../common/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { resetPasswordEmail } from '@src/emails/reset-passcode';
import { ConfigService } from '@nestjs/config';
import { ConfigAttributes } from '@src/config';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    @InjectModel(Customer.name) private customer: Model<Customer>,
    private jwtService: JwtService,
    private ee: EventEmitter2,
    private configService: ConfigService<ConfigAttributes>,
  ) {}
  private logger = new Logger(CustomerService.name);

  async validateCustomer(email: string) {
    try {
      const isCustomerExist = await this.customer.findOne({
        email,
      });
      if (isCustomerExist) {
        this.logger.error('email already exists');
        return {
          exist: true,
        };
      }

      return {
        exists: false,
      };
    } catch (error) {
      this.logger.error(error);
    }
  }

  async createCustomer(payload: CustomerAttributes) {
    const customerDetails = await this.customer.findOne({
      email: payload.email,
    });
    if (customerDetails && customerDetails.status === CustomerStatus.Active) {
      this.logger.error('Customer already exist');
      throw new BadRequestException(
        'Customer already exist, Please try resetting your passcode!',
      );
    }

    if (customerDetails && customerDetails.status === CustomerStatus.Disabled) {
      this.logger.error('Customer already exist');
      throw new BadRequestException(
        'Unable to complete operation, Please contact support!',
      );
    }

    if (customerDetails && customerDetails.status === CustomerStatus.Pending) {
      this.logger.log('customer exists, sending otp code');
      const jwtToken = getCustomerToken(customerDetails, this.jwtService);
      await this.sendOtpCode({
        id: customerDetails.id,
        first_name: customerDetails.first_name,
        email: customerDetails.email,
      });
      return { user: customerDetails, access_token: jwtToken };
    }

    payload.passcode = getHashedPassword(payload.passcode);
    const newCustomerDetails = await this.customer.create(payload);
    await newCustomerDetails.save();

    // Create JWT for validating code
    const jwtToken = getCustomerToken(newCustomerDetails, this.jwtService);
    await this.sendOtpCode({
      id: newCustomerDetails.id,
      first_name: newCustomerDetails.first_name,
      email: newCustomerDetails.email,
    });
    return { user: newCustomerDetails, access_token: jwtToken };
  }

  async validateCustomerOtpCode({
    email,
    otpCode,
  }: {
    email: string;
    otpCode: string;
  }) {
    const cacheField = cacheKeys.otp(email);
    const otpCodeFromCache = await this.cacheService.get(cacheField);

    if (!otpCodeFromCache || String(otpCodeFromCache) !== String(otpCode)) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Get customer details
    const customerDetails = await this.customer.findOne({ email });
    customerDetails.status = CustomerStatus.Active;
    await customerDetails.save();
    await this.cacheService.del(cacheField);

    const access_token = getCustomerToken(customerDetails, this.jwtService);
    return { access_token };
  }

  async getCustomerProfile(customerId: string) {
    const customerDetails = await this.customer
      .findById(customerId)
      .select('first_name last_name email phone status id');
    return customerDetails;
  }

  async sendOtpCode({
    id,
    first_name,
    email,
    isResetPassword,
    token,
  }: {
    id: string;
    first_name: string;
    email: string;
    isResetPassword?: boolean;
    token?: string;
  }) {
    const otp_code = generateOtpCode();
    if (!isResetPassword) {
      const emailbody = compileTemplateWithData(EmailTemplates.VerifyOtp, {
        first_name,
        otp_code,
      });
      this.ee.emit(
        events.sendEmail,
        new SendEmailEvent({
          to: email,
          subject: 'Lumeo OTP Code',
          html: emailbody,
        }),
      );
      // Set OTP code in cache
      await this.cacheService.set(cacheKeys.otp(email), otp_code, 60000);
      return otp_code;
    }
    // Send OTP Reset
    const emailbody = resetPasswordEmail({
      resetLink: `${this.configService.get('frontendUrl', {
        infer: true,
      })}/dashboard/reset-passcode?token=${token}`,
      firstname: first_name,
    });
    this.ee.emit(
      events.sendEmail,
      new SendEmailEvent({
        to: email,
        subject: 'Reset Your Passcode',
        html: emailbody,
      }),
    );
    await this.cacheService.set(cacheKeys.otp(email), token, 60000);
    return otp_code;
  }

  async getCustomerDetailsbyToken(token: string) {
    const details = this.jwtService.decode(token);
    if (!details) return null;

    const customerDetails = await this.customer.findOne({
      email: details.email,
    });

    return customerDetails;
  }

  async updateCustomerProfile(payload: CustomerAttributes) {
    const customer = await this.customer.findByIdAndUpdate(
      payload.id,
      { ...payload },
      {
        new: true,
      },
    );

    return customer;
  }
}
