import {
  AuthenticatedCorporate,
  CorporateAuth,
} from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { CorporateUser, FacilityManagerUser } from '@common/types';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateApplicationDto, CreateBusinessApplicationDto } from '@src/smart-bin/dto/binAppDto';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';

@ApiTags('Corporate Smart Bin')
@Controller({
  path: 'corporates/smart-bin',
  version: '1',
})
@CorporateAuth()
export class SmartBinController {
  constructor(private readonly smartBinService: SmartBinService) {}

  @Get('applications')
  async getSmartBinApplications(
    @AuthenticatedCorporate() corporate: CorporateUser,
  ) {
    const response =
      await this.smartBinService.getCorporateBinApplication(corporate.id);

    return new SuccessResponse(
      'Smart Bin applications retrieved successfully',
      response,
    );
  }

  @Post('applications')
  async createSmartBinApplication(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() dto: CreateBusinessApplicationDto
  ) {
    const response = await this.smartBinService.createBinApplication({
      accountId: corporate.id,
      accountType: corporate.role,
      applicationData: dto,
    });

    return new SuccessResponse(
      'Smart Bin application for your corporation created successfully',
      response,
    );
  }

  @Get('applications/:id')
  async getSmartBinApplicationById(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Param('id') id: string,
  ) {
    const response = await this.smartBinService.getBinApplicationDetails(id);

    return new SuccessResponse(
      'Smart Bin application retrieved successfully',
      response,
    );
  }
}
