import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminUser } from '@common/types';
import { GetPickupsForPspDto } from '@src/waste-management/pickup/dto/pickup.dto';
import { RevenueOverviewDto, DashboardFiltersDto } from '@src/super-admin/dto';
import { SuperAdminService } from '@src/super-admin/super-admin.service';

@ApiTags('Admin/Superadmins')
@Controller({
  path: 'lawma/superadmins',
  version: '1',
})
// @AdminAuth()
export class SuperadminsController {
  constructor(private readonly superAdminService: SuperAdminService) { }

  @Get('dashboard')
  async getSuperAdminDashboard(@Query() filters?: DashboardFiltersDto) {
    return this.superAdminService.getSuperAdminDashboard(filters);
  }

  @Get('admin-dashboard')
  async getAdminDashboard() {
    return this.superAdminService.getLawmaAdminDashboard();
  }



  @Get('all-psp-revenue')
  async getPspRevenueForAdmin(
    admin: AdminUser,
    @Query() filters?: GetPickupsForPspDto,
  ) {
    return this.superAdminService.getPspRevenueForAdmin(admin, filters);
  }

  @Get('revenue-analysis')
  async getRevenue(@Query() filters?: RevenueOverviewDto) {
    return this.superAdminService.getRevenue(filters);
  }
}
