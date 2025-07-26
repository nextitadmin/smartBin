import {
  AuthenticatedFacilityManager,
  FacilityManagerAuth,
} from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { FacilityManagerUser } from '@common/types';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateApplicationDto } from '@src/smart-bin/dto/binAppDto';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';

@ApiTags('Facility Manager Smart Bin')
@Controller({
  path: 'facility-managers/smart-bin',
  version: '1',
})
@FacilityManagerAuth()
export class SmartBinController {
  constructor(private readonly smartBinService: SmartBinService) {}

  @Get('applications')
  async getSmartBinApplications(
    @AuthenticatedFacilityManager() facilityManager: FacilityManagerUser,
  ) {
    const response =
      await this.smartBinService.getFacilityManagerBinApplication(
        facilityManager.id,
      );

    return new SuccessResponse(
      'Smart Bin applications retrieved successfully',
      response,
    );
  }

  @Post('applications')
  async createSmartBinApplication(
    @AuthenticatedFacilityManager() facilityManager: FacilityManagerUser,
    @Body() dto: CreateApplicationDto,
  ) {
    const response = await this.smartBinService.createBinApplication({
      accountId: facilityManager.id,
      accountType: facilityManager.role,
      applicationData: dto,
    });

    return new SuccessResponse(
      'Smart Bin application created successfully',
      response,
    );
  }

  @Get('applications/:id')
  async getSmartBinApplicationById(
    @AuthenticatedFacilityManager() facilityManager: FacilityManagerUser,
    @Param('id') id: string,
  ) {
    const response = await this.smartBinService.getBinApplicationDetails(id);

    return new SuccessResponse(
      'Smart Bin application retrieved successfully',
      response,
    );
  }
}
