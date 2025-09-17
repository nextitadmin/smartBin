import { Controller, Get, Param, Query } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SmartBinService } from './smart-bin.service';
import { AuthUser } from '@common/types';
import { ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';
import { AdminMessagePatternCommands } from '@src/shared/constants';

@Controller({
  path: 'smart-bins',
  version: '1',
})
export class AdminSmartBinController {
  constructor(private readonly smartBinService: SmartBinService) {}

  @Get('overview')
  async getSmartBinOverview() {
    const response = await this.smartBinService.getSmartBinOverview();
    return new SuccessResponse(
      'Smartbin overview retrieved successfully',
      response,
    );
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  async getApplications(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const records = await this.smartBinService.getAllApplications(
      Number(page),
      Number(limit),
    );
    return new SuccessResponse(
      'Smartbin applications retrieved successfully',
      records,
    );
  }

  @Get('delivered')
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  async getDeliveredApplications(
    @Param() param: { status: string },
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const response = await this.smartBinService.getDeliveredSmartBins(
      Number(page),
      Number(limit),
    );
    return new SuccessResponse(
      'Delivered bins retrieved successfully',
      response,
    );
  }

  @Get('application-details')
  @ApiQuery({ name: 'applicationId', type: String, required: true })
  async getApplicationDetails(@Query('applicationId') applicationId: string) {
    const details =
      await this.smartBinService.getBinApplicationById(applicationId);
    return new SuccessResponse(
      'Application details retrieved successfully',
      details,
    );
  }
}
