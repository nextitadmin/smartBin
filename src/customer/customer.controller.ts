import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { BodySchema } from '@common/joi';
import {
  validateCreateCustomer,
  validateCustomerEmail,
} from './schema/request';
import { CustomerAttributes } from '@models/customer.model';
import { SuccessResponse } from '@common/http';
import { CustomerService } from './customer.service';
import {
  AuthenticatedCustomer,
  CustomerAuth,
} from '../common/decorators/auth.decorator';
import { AuthCustomer } from '../common/types';

@Controller({
  path: 'customers',
  version: '1',
})
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Post('/validate')
  @BodySchema(validateCustomerEmail)
  async validateCustomerEmail(@Body() body: Pick<CustomerAttributes, 'email'>) {
    const response = await this.customerService.validateCustomer(body.email);
    return new SuccessResponse(
      'Customer email validated successfully!',
      response,
    );
  }

  @Post()
  @BodySchema(validateCreateCustomer)
  async createCustomer(@Body() body: CustomerAttributes) {
    const response = await this.customerService.createCustomer(body);
    return new SuccessResponse('Customer created successfully!', response);
  }

  @Post('/validate-otp')
  @BodySchema(validateCustomerEmail)
  @HttpCode(HttpStatus.OK)
  async validateCustomerOtp(@Body() body: { email: string; otpCode: string }) {
    const response = await this.customerService.validateCustomerOtpCode({
      email: body.email,
      otpCode: body.otpCode,
    });
    return new SuccessResponse(
      'Customer email validated successfully!',
      response,
    );
  }

  @Get('/profile')
  @CustomerAuth()
  async getCustomerProfile(@AuthenticatedCustomer() customer: AuthCustomer) {
    const response = await this.customerService.getCustomerProfile(customer.id);
    return new SuccessResponse('profile retrieved successfully!', response);
  }
}
