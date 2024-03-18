import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Customer } from '../models/customer.model';
import { InjectModel } from '@nestjs/sequelize';
import { comparePassword, getCustomerToken } from '../common/utils';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(Customer) private customerModel: typeof Customer,
    private jwtService: JwtService,
  ) {}

  private logger = new Logger(AuthenticationService.name);

  async login({ email, passcode }: { email: string; passcode: string }) {
    // Validate user
    const customer = await this.customerModel.findOne({
      where: {
        email,
      },
    });
    console.log({ customer }, 'cciuucu');
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
    return {
      access_token,
    };
  }
}
