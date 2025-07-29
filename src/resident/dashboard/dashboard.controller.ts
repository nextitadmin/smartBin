import { Controller, Get } from '@nestjs/common';
import { DashboardService } from '@src/dashboard/dashboard.service';
import { SuccessResponse } from '@common/http';
import {
  ResidentAuth,
  AuthenticatedResident
} from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller({
  path: 'dashboard',
  version: '1',
})
export class DashboardController {
  constructor(private readonly dasboard: DashboardService) {}
  @ResidentAuth()
  @Get('resident')
  async getResidentDashboard(@AuthenticatedResident() resident:AuthUser) {
    const response = await this.dasboard.getResidentDashboard(resident.id);
    return new SuccessResponse('Resident dashboard retrieved successfully', response);
  }
}