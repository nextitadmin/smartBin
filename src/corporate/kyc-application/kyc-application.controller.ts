import {
  AuthenticatedCorporate,
  AuthenticatedResident,
  CorporateAuth,
  ResidentAuth,
} from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { CorporateUser, ResidentUser } from '@common/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  AddressVerificationDto,
  CompanyInfoDto,
  CreateKycDto,
  IdVerificationDto,
  PersonalInfoDto,
  SignatoriesDto,
  TeamMemberDto,
  UpdateTeamMemberDto,
} from '@src/kyc/dto/kyc.dto';
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

  @Post('/')
  async submitKyc(
    @Body() dto: CreateKycDto,
    @AuthenticatedCorporate() corporate: CorporateUser,
  ) {
    const response = await this.kycService.createCorporateKyc({
      userId: corporate.id,
      accountType: corporate.role,
      applicationData: dto,
    });
    return new SuccessResponse(
      'Corporate Kyc Information submitted successfully',
      response,
    );
  }

  @Patch('add-company-info')
  async submitPersonalInformation(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() dto: CompanyInfoDto,
  ) {
    const response = await this.kycService.submitPersonalInformation({
      userId: corporate.id,
      accountType: corporate.role,
      applicationData: dto,
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
      applicationData: dto,
    });

    return new SuccessResponse(
      'Identity Information submitted successfully',
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
      applicationData: dto,
    });

    return new SuccessResponse('Signatories submitted successfully', response);
  }

  @Get('status')
  async getKycApplicationStatus(
    @AuthenticatedCorporate() corporate: CorporateUser,
  ) {
    const response = await this.kycService.verifyCorporateKycStatus({
      userId: corporate.id,
      accountType: corporate.role,
    });

    return new SuccessResponse('Kyc status retrieved successfully', response);
  }

  @Post('add-corporate-member')
  async addCorporateSignatory(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() body: TeamMemberDto,
  ) {
    const response = await this.kycService.addCorporateSignatory({
      userId: corporate.id,
      accountType: corporate.role,
      signatoryData: body,
    });

    return new SuccessResponse(
      'Corporate team member added successfully',
      response.data,
    );
  }

  @Get('get-all-team')
  async getAllSignatories(@AuthenticatedCorporate() corporate: CorporateUser) {
    const response = await this.kycService.getAllSignatories({
      userId: corporate.id,
      accountType: corporate.role,
    });

    return new SuccessResponse(
      'All corporate team members retrieved successfully',
      response.data,
    );
  }

  @Get('team-members/:teamMemberId')
  async getTeamMember(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Param('teamMemberId') teamMemberId: string,
  ) {
    const response = await this.kycService.getSingleSignatory({
      userId: corporate.id,
      accountType: corporate.role,
      teamMemberId,
    });

    return new SuccessResponse(
      'Team member retrieved successfully',
      response.data,
    );
  }

  @Put('team-members/:teamMemberId')
  async updateSignatory(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() updateTeamMemberDetails: UpdateTeamMemberDto,
    @Param('teamMemberId') teamMemberId: string,
  ) {
    const response = await this.kycService.updateSignatory({
      userId: corporate.id,
      accountType: corporate.role,
      signatoryData: updateTeamMemberDetails,
      teamMemberId,
    });

    return new SuccessResponse(
      'Team member details updated successfully',
      response,
    );
  }

  @Delete('team-members/:teamMemberId')
  async deleteSignatory(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Param('teamMemberId') teamMemberId: string,
  ) {
    const response = await this.kycService.removeSignatory({
      userId: corporate.id,
      accountType: corporate.role,
      teamMemberId,
    });

    return new SuccessResponse(response.message, response.data);
  }
}
