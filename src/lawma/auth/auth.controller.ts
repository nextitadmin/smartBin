import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LawmaAuthCompletePasswordResetDto,
  LawmaAuthLoginDto,
  LawmaAuthPasswordResetDto,
  LawmaAuthVerifyDto,
} from './dto/auth.dto';
import { SuccessResponse } from '@common/http';
import { AdminUser } from '@common/types';
import {
  AdminAuth,
  AuthenticatedAdmin,
} from '@common/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@common/guards/public.guard';
import { Request as UserRequest } from 'express';

@ApiTags('Lawma - Administrator Auth')
@Controller({
  path: 'lawma/auth',
  version: '1',
})
@AdminAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LawmaAuthLoginDto) {
    const response = await this.authService.login(body);
    return new SuccessResponse('Login successful', response);
  }

  @Public()
  @Post('verify-login')
  async verifyLogin(@Body() body: LawmaAuthVerifyDto, @Req() req: UserRequest) {
    const response = await this.authService.verifyLoginCode(body.code, req);
    return new SuccessResponse('Login verified', response);
  }

  @Public()
  @Post('passwords/reset')
  async passwordReset(@Body() body: LawmaAuthPasswordResetDto) {
    const response = await this.authService.initiateResetPassword(body.email);
    return new SuccessResponse('Password reset successful', response);
  }

  @Public()
  @Post('password/reset/verify')
  async verifyPasswordReset(@Body() body: LawmaAuthVerifyDto) {
    const response = await this.authService.verifyResetPasswordCode(body.code);
    return new SuccessResponse('Password reset verified', response);
  }

  @Post('passwords/reset/complete')
  async completePasswordReset(
    @AuthenticatedAdmin() admin: AdminUser,
    @Body() body: LawmaAuthCompletePasswordResetDto,
  ) {
    const response = await this.authService.completeResetPassword({
      adminId: admin.id,
      ...body,
    });
    return new SuccessResponse('Password reset completed', response);
  }

  @Get('me')
  async getMe(@AuthenticatedAdmin() user: AdminUser) {
    return new SuccessResponse('User fetched', user);
  }
}
