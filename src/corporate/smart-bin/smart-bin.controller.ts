import {
  AuthenticatedCorporate,
  CorporateAuth,
} from '@common/decorators/auth.decorator';
import { PaginationQueryDto } from '@common/dto';
import { SuccessResponse, PaginatedSuccessResponse } from '@common/http';
import { CorporateUser, FacilityManagerUser } from '@common/types';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateApplicationDto,
  CreateBusinessApplicationDto,
} from '@src/smart-bin/dto/binAppDto';
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
    @Query() query: PaginationQueryDto,
  ) {
    const { page = '1', limit = '10' } = query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const { data, paging } =
      await this.smartBinService.getCorporateBinApplication(
        corporate.id,
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
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() dto: CreateBusinessApplicationDto,
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
