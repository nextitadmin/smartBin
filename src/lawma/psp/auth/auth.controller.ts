import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PspAuthService } from './auth.service';
import {
  PspForgotPasswordDto,
  PspLoginDto,
  PspResetPasswordDto,
  PspVerifyResetCodeDto,
  VerifyPspLogin,
} from '../dto/psp.dto';
import { SuccessResponse } from '@common/http';
import {
  AuthenticatedPspAdmin,
  PspAdminAuth,
} from '@common/decorators/auth.decorator';
import { PspAdminUser } from '@common/types';

@ApiTags('PSPs Authentication')
@Controller({
  path: 'psps/auth',
  version: '1',
})
export class PspAuthController {
  constructor(private readonly pspAuthService: PspAuthService) {}

  @Post('login')
  async login(@Body() body: PspLoginDto) {
    await this.pspAuthService.login(body);
    return new SuccessResponse('Verification code sent to your email', null);
  }

  @Post('verify-login')
  async verifyLogin(@Body() body: VerifyPspLogin) {
    const psp = await this.pspAuthService.verifyLoginCode(body.code);
    return new SuccessResponse(psp.message, {
      token: psp.token,
      attributes: psp.data,
    });
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: PspForgotPasswordDto) {
    const response = await this.pspAuthService.requestPasswordReset(body);
    return new SuccessResponse(response.message, null);
  }

  @Post('verify-password-reset')
  async verifyReset(
    @Body() body: PspVerifyResetCodeDto,
    @Req() req: Request | any,
  ) {
    const response = await this.pspAuthService.verifyPasswordResetCode(body);
    return new SuccessResponse('success', response);
  }

  @Post('reset-password')
  @PspAdminAuth()
  async resetPassword(
    @AuthenticatedPspAdmin() psp: PspAdminUser,
    @Body() body: PspResetPasswordDto,
  ) {
    const response = await this.pspAuthService.resetPassword(psp.id, body);

    return new SuccessResponse('reset password successful', response);
  }

  @Post('logout')
  @PspAdminAuth()
  async logout(@AuthenticatedPspAdmin() psp: PspAdminUser) {
    const response = await this.pspAuthService.logout(psp.token);
    return new SuccessResponse(response.message, null);
  }
}
