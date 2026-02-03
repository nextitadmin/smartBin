import { Controller, Get ,Query} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LawmaSuperadminsService } from './superadmins.service';
import { AdminUser } from '@common/types';
import { GetPickupsForPspDto } from '@src/waste-management/pickup/dto/pickup.dto';
import { AuthenticatedAdmin } from '@common/decorators/auth.decorator';
import { RevenueOverviewDto } from '@src/super-admin/dto';

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
  // @Get('revenue-overview')
  // async getRevenueOverview() {
  //   return this.superAdminService.getRevenueOverview();
  // }

  @Get('revenue-overview')
async getRevenueOverview() {
  return this.superAdminService.getRevenueOverview();
}

  @Get('revenue')
async getRevenue(
  @Query() filters?: RevenueOverviewDto,
) {
  return this.superAdminService.getRevenue(filters);
}

  @Get('admin-dashboard')
  async getAdminDashboard() {
    return this.superAdminService.getLawmaAdminDashboard();
  }
  @Get('psp-revenue-analysis')
  async getPspRevenueAnalysis() {
    return this.superAdminService.getPspRevenueAnalysis();
  }

  @Get('all-psp-revenue')
  async getPspRevenueForAdmin(admin: AdminUser, @Query()  filters?: GetPickupsForPspDto) {
    return this.superAdminService.getPspRevenueForAdmin(admin,filters);
  }


}

