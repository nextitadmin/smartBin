import {
    AuthenticatedCorporate,
  AuthenticatedResident,
  CorporateAuth,
  ResidentAuth,
} from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { CorporateUser, ResidentUser } from '@common/types';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddressVerificationDto, IdVerificationDto, PersonalInfoDto } from '@src/kyc/dto/kyc.dto';
import { KycService } from '@src/kyc/kyc.service';
import { CorporateService } from '../corporate.service';

@ApiTags('Corporate Kyc Application')
@Controller({
  path: 'corporate/kyc',
  version: '1',
})
@CorporateAuth()
export class KycApplicationController {
  constructor(private readonly kycService: KycService) {}

  @Patch('personal-info')
  async submitPersonalInformation(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() dto: PersonalInfoDto,
  ) {
    const response = await this.kycService.submitPersonalInformation({
      userId: corporate.id,
      accountType: corporate.role,
      applicationData: dto
    });

    return new SuccessResponse(
      'Personal Information submitted successfully',
      response,
    );
  }

  @Patch('id-verification')
  async idVerification(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() dto: IdVerificationDto,
  ) {
    const response = await this.kycService.idVerification({
      userId: corporate.id,
      accountType: corporate.role,
      applicationData: dto
    });

    return new SuccessResponse(
      'Identify Information submitted successfully',
      response,
    );
  }

  @Patch('address')
  async addressVerification(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() dto: AddressVerificationDto,
  ) {
    const response = await this.kycService.addressVerification({
      userId: corporate.id,
      accountType: corporate.role,
      applicationData: dto
    });

    return new SuccessResponse(
      'Address details submitted successfully',
      response,
    );
  }

  @Get('status')
  async getKycApplicationStatus(
    @AuthenticatedCorporate() corporate: CorporateUser,
  ) {
    const response = await this.kycService.verifyKycStatus({
      userId: corporate.id,
      accountType: corporate.role,
    });

    return new SuccessResponse(
      'Kyc status retrieved successfully',
      response,
    );
  }
}
