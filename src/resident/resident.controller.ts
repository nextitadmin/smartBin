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
import { CreateResidentAccountDto, ResidentLoginDto, VerifyResidentLogin, ResidentForgotPasswordDto, ResidentVerifyResetCodeDto, ResetPasswordDto } from './dto/resident.dto';

import { ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';

@ApiTags('Residents')
@Controller({
  path: 'residents',
  version: '1',
})
export class ResidentController {
  constructor(private readonly residentService: ResidentService) { }



  @Post('register')
  async register(@Body() body: CreateResidentAccountDto) {
    const agent = await this.residentService.registerResident(body);
    return new SuccessResponse(agent.message, agent.data);
  }

  @Post('login')
  async login(@Body() body: ResidentLoginDto) {
    await this.residentService.login(body);
    return new SuccessResponse('Verification code sent to your email', null);
  }

  @Post('verify-login')
  async verifyLogin(@Body() body: VerifyResidentLogin, @Req() req: Request) {
    const agent = await this.residentService.verifyLoginCode(body.code);
    return new SuccessResponse(agent.message, {
      token: agent.token,
      attributes: agent.data,
    });
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: ResidentForgotPasswordDto) {
    const response = await this.residentService.requestPasswordReset(body);
    return new SuccessResponse(response.message, null);
  }

  @Post('verify-password-reset')
  verifyReset(@Body() body: ResidentVerifyResetCodeDto, @Req() req: Request | any) {
    return this.residentService.verifyPasswordResetCode(body, req.session);
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto, @Req() req: Request | any) {
    return this.residentService.resetPassword(
      body.password,
      body.confirmPassword,
      req.session,
    );
  }



  @Get('profile')
  @ResidentAuth()
  async getProfile(@AuthenticatedResident() resident: AuthUser) {
    const response = await this.residentService.getProfile(resident.id);
    return new SuccessResponse('Resident details fetcted', response);
  }

  @Post('logout')
  @ResidentAuth()
  logout() {
    return this.residentService.logout();
  }

  @Patch('profile-picture')
  @ResidentAuth()
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @AuthenticatedResident() resident: AuthUser,
  ) {
    const response = await this.residentService.updateProfilePicture(
      resident.id,
      file.path,
    );
    return new SuccessResponse('profile picture updated', null);
  }
}
