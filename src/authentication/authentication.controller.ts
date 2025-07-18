import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { BodySchema } from '@common/joi';
// import { validateCustomerLogin } from '@src/customer/schema/request';
import { SuccessResponse } from '@common/http';
// import { CustomerAttributes } from '@models/customer.model';

@Controller({
  path: 'authentication',
  version: '1',
})
export class AuthenticationController {
  // constructor(private readonly authenticationService: AuthenticationService) {}
  // @Post()
  // @HttpCode(HttpStatus.OK)
  // // @BodySchema(validateCustomerLogin)
  // async login(@Body() body: CustomerAttributes) {
  //   const loginData = await this.authenticationService.login(body);
  //   return new SuccessResponse('Customer logged in successfully!', loginData);
  // }
  // @Post('forgot-passcode')
  // @HttpCode(HttpStatus.OK)
  // async forgotPasscode(@Body() body: CustomerAttributes) {
  //   const passcode = await this.authenticationService.forgotPasscode(body);
  //   return new SuccessResponse('reset password initiated!', passcode);
  // }
  // @Get('reset-passcode/validate')
  // async resetPassword(@Query('token') token: string) {
  //   const passcode = await this.authenticationService.validateResetToken({
  //     token,
  //   });
  //   return new SuccessResponse('token valid', passcode);
  // }
  // @Patch('passcode')
  // @HttpCode(HttpStatus.OK)
  // async updatePasscode(@Body() body: { token: string; newPasscode: string }) {
  //   const passcode = await this.authenticationService.updatePasscode(body);
  //   return new SuccessResponse('passcode updated', passcode);
  // }
}
