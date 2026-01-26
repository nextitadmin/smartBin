import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LawmaSuperadminsService } from './superadmins.service';

@ApiTags('Admin/Superadmins')
@Controller({
  path: 'lawma/superadmins',
  version: '1',
})
export class SuperadminsController {
  constructor(private readonly superAdminService: LawmaSuperadminsService) {}

  @Get('dashboard')
  async getSuperAdminDashboard() {
    return this.superAdminService.getSuperAdminDashboard();
  }
  @Get('revenue-overview')
  async getRevenueOverview() {
    return this.superAdminService.getRevenueOverview();
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

