import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { FacilityManagerService } from './facility-manager.service';
import { Public } from '@common/guards/public.guard';
import {
  CreateManagerAccountDto,
  LoginManagerAccountDto,
  UpdatePasswordDto,
  UpdatePictureDto,
  VerifyLogin,
} from './dto/facility-manager.dto';
import { SuccessResponse } from '@common/http';
import {
  AuthenticatedFacilityManager,
  FacilityManagerAuth,
} from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Facility Managers')
@Controller({
  path: 'facility-managers',
  version: '1',
})
export class FacilityManagerController {
  constructor(
    private readonly facilityManagerService: FacilityManagerService,
  ) {}

  @Post('account')
  @Public()
  async createFacilityManagerAccount(@Body() body: CreateManagerAccountDto) {
    const response = await this.facilityManagerService.register(body);
    return new SuccessResponse('manager account created', response);
  }

  @Post('login')
  @Public()
  async loginFacilityManagerAccount(@Body() body: LoginManagerAccountDto) {
    const response = await this.facilityManagerService.login(body);
    return new SuccessResponse(
      'A verification code has been sent to your email.',
      response,
    );
  }

  @Post('login/verify')
  @Public()
  async verifyFacilityManagerLogin(@Body() body: VerifyLogin) {
    const response = await this.facilityManagerService.verifyLoginCode(
      body.code,
    );
    return new SuccessResponse('Login successful', response);
  }

  @Post('account/password/request')
  @Public()
  async requestFacilityManagerPasswordReset(
    @Body() body: Pick<LoginManagerAccountDto, 'email'>,
  ) {
    const response = await this.facilityManagerService.requestPasswordReset(
      body.email,
    );
    return new SuccessResponse('Password reset request sent', response);
  }

  @Post('account/password/verify')
  @Public()
  async verifyFacilityManagerPasswordReset(@Body() body: VerifyLogin) {
    const response = await this.facilityManagerService.verifyResetCode(
      body.code,
    );
    return new SuccessResponse('Password reset code verified', response);
  }

  @Post('account/password/complete')
  @FacilityManagerAuth()
  async completeFacilityManagerPasswordReset(
    @AuthenticatedFacilityManager() facilityManager: AuthUser,
    @Body() body: UpdatePasswordDto,
  ) {
    const response = await this.facilityManagerService.completePasswordReset(
      facilityManager.id,
      body,
    );
    return new SuccessResponse(response.message, null);
  }

  @Put('account/profile-picture')
  @FacilityManagerAuth()
  async updateFacilityManagerAccount(
    @Body() body: UpdatePictureDto,
    @AuthenticatedFacilityManager() facilityManager: AuthUser,
  ) {
    const response = await this.facilityManagerService.updateProfilePicture(
      facilityManager.id,
      body.profilePicture,
    );
    return new SuccessResponse('manager account updated', response);
  }

  @Get('profile')
  @FacilityManagerAuth()
  async getFacilityManagerAccount(
    @AuthenticatedFacilityManager() facilityManager: AuthUser,
  ) {
    const response = await this.facilityManagerService.getProfile(
      facilityManager.id,
    );
    return new SuccessResponse('Manager account retrieved', response);
  }

  @Post('account/logout')
  @FacilityManagerAuth()
  async logoutFacilityManagerAccount(
    @AuthenticatedFacilityManager() facilityManager: AuthUser,
  ) {
    const response = await this.facilityManagerService.logout(
      facilityManager.id,
    );
    return new SuccessResponse('Manager account logged out', response);
  }
}
