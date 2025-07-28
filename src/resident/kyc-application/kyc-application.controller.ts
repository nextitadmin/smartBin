import {
  AuthenticatedResident,
  ResidentAuth,
} from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { ResidentUser } from '@common/types';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddressVerificationDto, IdVerificationDto, PersonalInfoDto } from '@src/kyc/dto/kyc.dto';
import { KycService } from '@src/kyc/kyc.service';

@ApiTags('Resident Kyc Application')
@Controller({
  path: 'resident/kyc',
  version: '1',
})
@ResidentAuth()
export class KycApplicationController {
  constructor(private readonly kycService: KycService) {}

  @Patch('personal-info')
  async submitPersonalInformation(
    @AuthenticatedResident() resident: ResidentUser,
    @Body() dto: PersonalInfoDto,
  ) {
    const response = await this.kycService.submitPersonalInformation({
      userId: resident.id,
      accountType: resident.role,
      applicationData: dto
    });

    return new SuccessResponse(
      'Personal Information submitted successfully',
      response,
    );
  }

  @Patch('id-verification')
  async idVerification(
    @AuthenticatedResident() resident: ResidentUser,
    @Body() dto: IdVerificationDto,
  ) {
    const response = await this.kycService.idVerification({
      userId: resident.id,
      accountType: resident.role,
      applicationData: dto
    });

    return new SuccessResponse(
      'Identify Information submitted successfully',
      response,
    );
  }

  @Patch('address')
  async addressVerification(
    @AuthenticatedResident() resident: ResidentUser,
    @Body() dto: AddressVerificationDto,
  ) {
    const response = await this.kycService.addressVerification({
      userId: resident.id,
      accountType: resident.role,
      applicationData: dto
    });

    return new SuccessResponse(
      'Address details submitted successfully',
      response,
    );
  }

  @Get('status')
  async getKycApplicationStatus(
    @AuthenticatedResident() resident: ResidentUser,
  ) {
    const response = await this.kycService.verifyKycStatus({
      userId: resident.id,
      accountType: resident.role,
    });

    return new SuccessResponse(
      'Kyc status retrieved successfully',
      response,
    );
  }
}
