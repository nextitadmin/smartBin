import { Controller, Get } from '@nestjs/common';
import { DashboardService } from '@src/dashboard/dashboard.service';
import { SuccessResponse } from '@common/http';
import {
  CorporateAuth,
  AuthenticatedCorporate,
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
  async getCorporateDashboard(@AuthenticatedCorporate() corporate: AuthUser) {
    const response = await this.dasboard.getCorporateDashboard(corporate.id);
    return new SuccessResponse(
      'Corporate business dashboard retrieved successfully',
      response,
    );
  }
}
