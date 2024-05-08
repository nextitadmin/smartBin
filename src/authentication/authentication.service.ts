import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Customer } from '../models/customer.model';
import { InjectModel } from '@nestjs/mongoose';
import { comparePassword, getCustomerToken } from '../common/utils';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { events } from '@common/constants';
import { KycUpgradedEvent } from '@src/kyc/kyc.event';
import { KycTier } from '@models/kyc.model';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
    private jwtService: JwtService,
    private ee: EventEmitter2,
  ) {}

  private logger = new Logger(AuthenticationService.name);

  async login({ email, passcode }: { email: string; passcode: string }) {
    // Validate user
    const customer = await this.customerModel.findOne({
      email,
    });
    if (!customer) {
      this.logger.error('Invalid email');
      throw new UnauthorizedException('Invalid Customer Details');
    }

    // Validate passcode
    const validPasscode = comparePassword(passcode, customer.passcode);
    if (!validPasscode) {
      this.logger.error('Invalid passcode');
      throw new UnauthorizedException('Invalid Customer Details');
    }

    const access_token = getCustomerToken(customer, this.jwtService);
    this.ee.emit(
      events.kyc.upgraded,
      new KycUpgradedEvent({
        customer_id: String(customer._id),
        bvn: Math.floor(Math.random() * 1000000000).toString(),
        tier: KycTier.One,
      }),
    );
    return {
      access_token,
    };
  }
}
