import {
  AuthenticatedFacilityManager,
  FacilityManagerAuth,
} from '@common/decorators/auth.decorator';
import { PaginationQueryDto } from '@common/dto';
import { PaginatedSuccessResponse, SuccessResponse } from '@common/http';
import { FacilityManagerUser } from '@common/types';
import { Body, Controller, Get, Param, Post, Query, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateApplicationDto,
  CreateFacilityApplicationDto,
} from '@src/smart-bin/dto/binAppDto';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';

@ApiTags('Facility Manager Smart Bin')
@Controller({
  path: 'facility-managers/smart-bin',
  version: '1',
})
@FacilityManagerAuth()
export class SmartBinController {
  constructor(private readonly smartBinService: SmartBinService) { }

  @Get('applications')
  async getSmartBinApplications(
    @AuthenticatedFacilityManager() facilityManager: FacilityManagerUser,
    @Query() query: PaginationQueryDto,
  ) {
    const { page = '1', limit = '10' } = query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const { data, paging } =
      await this.smartBinService.getFacilityBinApplication(
        facilityManager.id,
        pageNumber,
        limitNumber,
      );

    return new PaginatedSuccessResponse(
      'Smart Bin applications retrieved successfully',
      data,
      paging,
    );
  }

  @Post('applications')
  async createSmartBinApplication(
    @AuthenticatedFacilityManager() facilityManager: FacilityManagerUser,
    @Body() dto: CreateFacilityApplicationDto,
  ) {
    const response = await this.smartBinService.createFacilityBinApplication({
      accountId: facilityManager.id,
      accountType: facilityManager.role,
      applicationData: dto,
    });

    return new SuccessResponse(
      'Smart Bin application for your facility created successfully',
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

  @Get('applications/:orderId/tracker')
      async trackApplication(@Param('orderId') orderId: string) {
        return this.smartBinService.getOrderTimeline(orderId);
    }

  @Delete('applications/:id')
  async deleteBinApplication(
    @AuthenticatedFacilityManager() facilityManager: FacilityManagerUser,
    @Param('id') id: string,
  ) {
    const response = await this.smartBinService.deleteBinApplication(id);

    return new SuccessResponse('Smart Bin application deleted successfully', response);
  }
}
