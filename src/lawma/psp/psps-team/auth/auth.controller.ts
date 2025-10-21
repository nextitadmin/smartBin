import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PspTeamAuthService } from './auth.service';
import {
  PspForgotPasswordDto,
  PspLoginDto,
  PspResetPasswordDto,
  PspVerifyResetCodeDto,
  VerifyPspLogin,
} from '../../dto/psp.dto';
import { SuccessResponse } from '@common/http';
import {
  AuthenticatedPspAdmin,
  PspAdminAuth,
} from '@common/decorators/auth.decorator';
import { PspAdminUser } from '@common/types';

@ApiTags('PSP Team Members Authentication')
@Controller({
  path: 'psps/team-members/auth',
  version: '1',
})
export class PspTeamAuthController {
  constructor(private readonly pspTeam: PspTeamAuthService) {}

  @Post('login')
  async login(@Body() body: PspLoginDto) {
    await this.pspTeam.login(body);
    return new SuccessResponse('Verification code sent to your email', null);
  }

  @Post('verify-login')
  async verifyLogin(@Body() body: VerifyPspLogin) {
    const psp = await this.pspTeam.verifyLoginCode(body.code);
    return new SuccessResponse(psp.message, {
      token: psp.token,
      attributes: psp.data,
    });
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: PspForgotPasswordDto) {
    const response = await this.pspTeam.requestPasswordReset(body);
    return new SuccessResponse(response.message, null);
  }

  @Post('verify-password-reset')
  async verifyReset(
    @Body() body: PspVerifyResetCodeDto,
    @Req() req: Request | any,
  ) {
    const response = await this.pspTeam.verifyPasswordResetCode(body);
    return new SuccessResponse('success', response);
  }

  @Post('reset-password')
  @PspAdminAuth()
  async resetPassword(
    @AuthenticatedPspAdmin() psp: PspAdminUser,
    @Body() body: PspResetPasswordDto,
  ) {
    const response = await this.pspTeam.resetPassword(psp.id, body);

    return new SuccessResponse('reset password successful', response);
  }

  @Post('logout')
  @PspAdminAuth()
  async logout(@AuthenticatedPspAdmin() psp: PspAdminUser) {
    const response = await this.pspTeam.logout(psp.token);
    return new SuccessResponse(response.message, null);
  }
}
