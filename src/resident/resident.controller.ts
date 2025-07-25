import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResidentService } from './resident.service';

import { diskStorage } from 'multer';
import { Request, Response } from 'express';
import {
  ResidentAuth,
  AuthenticatedResident,
} from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import {
  CreateResidentAccountDto,
  ResidentLoginDto,
  VerifyResidentLogin,
  ResidentForgotPasswordDto,
  ResidentVerifyResetCodeDto,
  ResetPasswordDto,
  ProfileDto,
  CreateApplicationDto,
} from './dto/resident.dto';

import { ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';
import { Public } from '@common/guards/public.guard';

@ApiTags('Residents')
@Controller({
  path: 'residents',
  version: '1',
})
export class ResidentController {
  constructor(private readonly residentService: ResidentService) {}

  @Public()
  @Post('register')
  async register(@Body() body: CreateResidentAccountDto) {
    const agent = await this.residentService.registerResident(body);
    return new SuccessResponse(agent.message, agent.data);
  }

  @Public()
  @Post('login')
  async login(@Body() body: ResidentLoginDto) {
    await this.residentService.login(body);
    return new SuccessResponse('Verification code sent to your email', null);
  }

  @Public()
  @Post('verify-login')
  async verifyLogin(@Body() body: VerifyResidentLogin) {
    const agent = await this.residentService.verifyLoginCode(body.code);
    return new SuccessResponse(agent.message, {
      token: agent.token,
      attributes: agent.data,
    });
  }

  @Public()
  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: ResidentForgotPasswordDto) {
    const response = await this.residentService.requestPasswordReset(body);
    return new SuccessResponse(response.message, null);
  }

  @Public()
  @Post('verify-password-reset')
  async verifyReset(
    @Body() body: ResidentVerifyResetCodeDto,
    @Req() req: Request | any,
  ) {
    const response = await this.residentService.verifyPasswordResetCode(
      body,
      req.session,
    );
    return new SuccessResponse('success', response);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Req() req: Request | any,
  ) {
    const response = await this.residentService.resetPassword(
      body.password,
      body.confirmPassword,
      req.session,
    );

    return new SuccessResponse('reset password successful', response);
  }

  @Get('profile')
  @ResidentAuth()
  async getProfile(@AuthenticatedResident() resident: AuthUser) {
    const response = await this.residentService.getProfile(resident.id);
    return new SuccessResponse('Resident details fetcted', response);
  }

  @Post('logout')
  @ResidentAuth()
  async logout(@AuthenticatedResident() resident: AuthUser) {
    const response = await this.residentService.logout(resident.token);
    return new SuccessResponse(response.message, null);
  }

  @Patch('profile-picture')
  @ResidentAuth()
  async updateProfilePicture(
    @Body() body: ProfileDto,
    @AuthenticatedResident() resident: AuthUser,
  ) {
    const response = await this.residentService.updateProfilePicture(
      resident.id,
      body.imageUrl,
    );
    return new SuccessResponse('profile picture updated', null);
  }

  @Post('apply-smart-bin')
  @ResidentAuth()
  async createSmartBinApplication(
    @Body() body: CreateApplicationDto,
    @AuthenticatedResident() resident: AuthUser,
  ){
    const response = await this.residentService.createBinApplication(body)
    return new SuccessResponse('', response);
  }
}
