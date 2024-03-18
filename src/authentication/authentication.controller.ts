import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { BodySchema } from '@common/joi';
import { validateCustomerLogin } from '@src/customer/schema/request';
import { SuccessResponse } from '@common/http';
import { CustomerAttributes } from '@models/customer.model';

@Controller({
  path: 'authentication',
  version: '1',
})
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @BodySchema(validateCustomerLogin)
  async login(@Body() body: CustomerAttributes) {
    const loginData = await this.authenticationService.login(body);
    return new SuccessResponse('Customer logged in successfully!', loginData);
  }
}
