import {
    AuthenticatedCorporate,
  AuthenticatedResident,
  CorporateAuth,
  ResidentAuth,
} from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { CorporateUser, ResidentUser } from '@common/types';
import { Body, Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddressVerificationDto, CompanyInfoDto, IdVerificationDto, PersonalInfoDto, SignatoriesDto } from '@src/kyc/dto/kyc.dto';
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

  @Patch('add-company-info')
  async submitPersonalInformation(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() dto: CompanyInfoDto,
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

  @Patch('add-id-verification')
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

  @Patch('add-signatories')
  async addressVerification(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() dto: SignatoriesDto,
  ) {
    const response = await this.kycService.addSignatories({
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
    const response = await this.kycService.verifyCorporateKycStatus({
      userId: corporate.id,
      accountType: corporate.role,
    });

    return new SuccessResponse(
      'Kyc status retrieved successfully',
      response,
    );
  }

  @Post('add-corporate-signatory')
  async addCorporateSignatory(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() signatoryDto: any, // Replace 'any' with a proper DTO if available
  ) {
    const response = await this.kycService.addCorporateSignatory({
      userId: corporate.id,
      accountType: corporate.role,
      signatoryData: signatoryDto,
    });

    return new SuccessResponse(
      'Corporate signatory added successfully',
      response,
    );
  }

  @Get('get-all-signatories')
  async getAllSignatories(
    @AuthenticatedCorporate() corporate: CorporateUser,
  ) {
    const response = await this.kycService.getAllSignatories({
      userId: corporate.id,
      accountType: corporate.role,
    });

    return new SuccessResponse(
      'All corporate signatories retrieved successfully',
      response,
    );
  }

  @Put('update-signatory')
  async updateSignatory(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() updateSignatoryDto: any, 
  ) {
    const response = await this.kycService.updateSignatory({
      userId: corporate.id,
      accountType: corporate.role,
      signatoryData: updateSignatoryDto,
    });

    return new SuccessResponse(
      'Corporate signatory updated successfully',
      response,
    );
  }

  @Delete('delete-signatory')
  async deleteSignatory(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body('signatoryId') signatoryId: string,
  ) {
    const response = await this.kycService.removeSignatory({
      userId: corporate.id,
      accountType: corporate.role,
      signatoryId,
    });

    return new SuccessResponse(
      'Corporate signatory deleted successfully',
      response,
    );
  }
}
