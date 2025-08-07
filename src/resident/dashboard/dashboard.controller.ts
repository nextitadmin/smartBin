import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from '@src/dashboard/dashboard.service';
import { SuccessResponse } from '@common/http';
import {
  ResidentAuth,
  AuthenticatedResident,
} from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller({
  path: 'residents/dashboard',
  version: '1',
})
export class DashboardController {
  constructor(private readonly dasboard: DashboardService) {}
  @ResidentAuth()
  @Get('')
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getResidentDashboard(
    @AuthenticatedResident() resident: AuthUser,
    @Query('year') year?: number,
  ) {
    const queryYear = year || new Date().getFullYear();
    const response = await this.dasboard.getResidentDashboard(
      resident.id,
      queryYear,
    );
    return new SuccessResponse(
      'Resident dashboard retrieved successfully',
      response,
    );
  }
}
