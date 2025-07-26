import { Body, Controller, Get, Param, Patch, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@common/guards/public.guard';
import { SuccessResponse } from '@common/http';
import { AuthenticatedCorporate, CorporateAuth } from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { CorporateForgotPasswordDto, CorporateLoginDto, CorporateVerifyResetCodeDto, CreateApplicationDto, CreateCorporateAccountDto, GetApplicationParamDto, ProfileDto, ResetPasswordDto, VerifyCorporateLogin } from './dto/corporate.dto';

@ApiTags('Corporates')
@Controller({
  path: 'corporate',
  version: '1'
})
export class CorporateController {
  constructor(private readonly corporateService: CorporateService) {}

   @Public()
    @Post('register')
    async register(@Body() body: CreateCorporateAccountDto) {
      const corporate = await this.corporateService.registerCorporate(body);
      return new SuccessResponse(corporate.message, corporate.data);
    }
  
    @Public()
    @Post('login')
    async login(@Body() body: CorporateLoginDto) {
      await this.corporateService.loginCorporate(body);
      return new SuccessResponse('Verification code sent to your email', null);
    }
  
    @Public()
    @Post('verify-login')
    async verifyLogin(@Body() body: VerifyCorporateLogin) {
      const corporate = await this.corporateService.verifyLoginCode(body.code);
      return new SuccessResponse(corporate.message, {
        token: corporate.token,
        attributes: corporate.data,
      });
    }
  
    // @Public()
    // @Post('request-password-reset')
    // async requestPasswordReset(@Body() body: CorporateForgotPasswordDto) {
    //   const corporate = await this.corporateService.requestPasswordReset(body);
    //   return new SuccessResponse(corporate.message, null);
    // }
  
    // @Public()
    // @Post('verify-password-reset')
    // async verifyReset(
    //   @Body() body: CorporateVerifyResetCodeDto,
    //   @Req() req: Request | any,
    // ) {
    //   const response = await this.corporateService.verifyPasswordResetCode(
    //     body,
    //     req.session,
    //   );
    //   return new SuccessResponse('success', response);
    // }
  
    // @Public()
    // @Post('reset-password')
    // async resetPassword(
    //   @Body() body: ResetPasswordDto,
    //   @Req() req: Request | any,
    // ) {
    //   const response = await this.corporateService.resetPassword(
    //     body.password,
    //     body.confirmPassword,
    //     req.session,
    //   );
  
    //   return new SuccessResponse('reset password successful', response);
    // }
  
    // @Get('profile')
    // @CorporateAuth()
    // async getProfile(@AuthenticatedCorporate() resident: AuthUser) {
    //   const response = await this.corporateService.getProfile(resident.id);
    //   return new SuccessResponse('Resident details fetcted', response);
    // }
  
    // @Post('logout')
    // @CorporateAuth()
    // async logout(@AuthenticatedCorporate() resident: AuthUser) {
    //   const response = await this.corporateService.logout(resident.token);
    //   return new SuccessResponse(response.message, null);
    // }
  
    // @Patch('profile-picture')
    // @CorporateAuth()
    // async updateProfilePicture(
    //   @Body() body: ProfileDto,
    //   @AuthenticatedCorporate() corporate: AuthUser,
    // ) {
    //   const response = await this.corporateService.updateProfilePicture(
    //     corporate.id,
    //     body.imageUrl,
    //   );
    //   return new SuccessResponse('profile picture updated', null);
    // }
  
    // @Post('apply-smart-bin')
    // @CorporateAuth()
    // async createSmartBinApplication(
    //   @Body() body: CreateApplicationDto,
    //   @AuthenticatedCorporate() corporate: AuthUser,
    // ) {
    //   const response = await this.corporateService.createBinApplication(body);
    //   return new SuccessResponse(
    //     'Application for smart bin submitted successfully',
    //     response,
    //   );
    // }
  
    // @Get('smart-bin-applications')
    // @CorporateAuth()
    // async getAllCorporateBinApplications(
    //   @AuthenticatedCorporate() resident: AuthUser,
    // ) {
    //   const response = await this.corporateService.getAllCorporateApplications(
    //     resident.id,
    //     resident.role,
    //   );
    //   return new SuccessResponse(
    //     'Application for smart bin submitted successfully',
    //     response,
    //   );
    // }
  
    // @Get('smart-bin-applications/:applicationId')
    // @CorporateAuth()
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async getApplicationDetails(
    //   @AuthenticatedCorporate() corporate: AuthUser,
    //   @Param() params: GetApplicationParamDto,
    // ) {
    //   const { applicationId } = params;
    //   const response = await this.corporateService.getApplicationDetails(
    //     applicationId,
    //   );
    //   return new SuccessResponse(
    //     'Smart Bin application retrieved successfully',
    //     response,
    //   );
    // }
}
