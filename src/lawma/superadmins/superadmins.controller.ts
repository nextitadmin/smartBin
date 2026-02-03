import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LawmaSuperadminsService } from './superadmins.service';

@ApiTags('Admin/Superadmins')
@Controller({
  path: 'lawma/superadmins',
  version: '1',
})
export class SuperadminsController {
  constructor(private readonly superAdminService: SuperAdminService) { }

  @Get('dashboard')
  async getSuperAdminDashboard() {
    return this.superAdminService.getSuperAdminDashboard();
  }

  @Get('psp-revenue')
  async getPspRevenueAnalysis(@Query('pspId') pspId?: string) {
    return this.superAdminService.getPspRevenueAnalysis(pspId);
  }

  @Get('households-by-lga')
  async getHouseholdByLga() {
    return this.superAdminService.getHouseholdByLga();
  }

  @Get('revenue-overview')
  async getRevenueOverview(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year) : new Date().getFullYear();
    return this.superAdminService.getRevenueOverview(yearNum);
  }

  @Get('admin-dashboard')
  async getAdminDashboard() {
    return this.superAdminService.getLawmaAdminDashboard();
  }
  @Get('psp-revenue-analysis')
  async getPspRevenueAnalysis() {
    return this.superAdminService.getPspRevenueAnalysis();
  }
}

