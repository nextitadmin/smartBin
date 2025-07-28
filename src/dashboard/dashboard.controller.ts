import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SuccessResponse } from '@common/http';
import {
  ResidentAuth,
  CorporateAuth,
  AuthenticatedCorporate,
  AuthenticatedResident,
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

  @CorporateAuth()
  @Get('corporate')
  async getCorporateDashboard(@AuthenticatedCorporate() corporate:AuthUser) {
    const response = await this.dasboard.getCorporateDashboard(corporate.id);
    return new SuccessResponse('Corporate business dashboard retrieved successfully', response);
  }

  @ResidentAuth()
  @Get('resident')
  async getResidentDashboard(@AuthenticatedResident() resident:AuthUser) {
    const response = await this.dasboard.getResidentDashboard(resident.id);
    return new SuccessResponse('Resident dashboard retrieved successfully', response);
  }
}
