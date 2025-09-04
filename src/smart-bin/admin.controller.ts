import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SmartBinService } from './smart-bin.service';
import { AuthUser } from '@common/types';
import { ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';
import { AdminMessagePatternCommands } from '@src/shared/constants';

@Controller({
  path: 'admin/smartbin',
  version: '1',
})
export class AdminSmartBinController {
  constructor(private readonly smartBinService: SmartBinService) {}

  @MessagePattern({ cmd: AdminMessagePatternCommands.Smartbin.GetOverview })
  async getSmartBinOverview() {
    const response = await this.smartBinService.getSmartBinOverview();
    return new SuccessResponse(
      'Smartbin overview retrieved successfully',
      response,
    );
  }

  @MessagePattern({ cmd: AdminMessagePatternCommands.Smartbin.GetApplications })
  async getAllApplications(payload: { page?: string; limit?: string }) {
    const page = parseInt(payload.page ?? '1', 10);
    const limit = parseInt(payload.limit ?? '10', 10);
    const records = await this.smartBinService.getAllApplications(page, limit);
    return new SuccessResponse(
      'Smartbin applications retrieved successfully',
      records,
    );
  }

  @MessagePattern({ cmd: 'GET_DELIVERED_BINS' })
  async getDeliveredBins(payload: { page?: string; limit?: string }) {
    const page = parseInt(payload.page ?? '1', 10);
    const limit = parseInt(payload.limit ?? '10', 10);
    const response = await this.smartBinService.getDeliveredSmartBins(
      page,
      limit,
    );
    return new SuccessResponse(
      'Delivered bins retrieved successfully',
      response,
    );
  }

  @MessagePattern({
    cmd: AdminMessagePatternCommands.Smartbin.GetApplicationDetails,
  })
  async applicationDetails(payload: { applicationId: string }) {
    const details = await this.smartBinService.getBinApplicationById(
      payload.applicationId,
    );
    return new SuccessResponse(
      'Application details retrieved successfully',
      details,
    );
  }
}
