import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from '@src/dashboard/dashboard.service';
import { SuccessResponse } from '@common/http';
import {
  CorporateAuth,
  AuthenticatedCorporate,
} from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller({
  path: 'dashboard',
  version: '1',
})
export class DashboardController {
  constructor(private readonly dasboard: DashboardService) { }

  @CorporateAuth()
  @Get('corporate')
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getCorporateDashboard(@AuthenticatedCorporate() corporate: AuthUser, @Query('year') year?: number,) {
    const queryYear = year || new Date().getFullYear();
    const response = await this.dasboard.getCorporateDashboard(corporate.id, queryYear);
    return new SuccessResponse(
      'Corporate business dashboard retrieved successfully',
      response,
    );
  }
}
