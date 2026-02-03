import { AdminUser } from '@common/types';
import { Injectable } from '@nestjs/common';
import { RevenueOverviewDto } from '@src/super-admin/dto';
import { SuperAdminService } from '@src/super-admin/super-admin.service';
import { GetPickupsForPspDto } from '@src/waste-management/pickup/dto/pickup.dto';
import { filter } from 'rxjs';

@Injectable()
export class LawmaSuperadminsService {
  constructor(private readonly superAdminService: SuperAdminService) {}

  async getSuperAdminDashboard() {
    return this.superAdminService.getSuperAdminDashboard();
  }

  async getRevenueOverview() {
    return this.superAdminService.getRevenueOverview();
  }


   async getRevenue(filters?: RevenueOverviewDto) {
    return this.superAdminService.getRevenue(filters);
   }

  async getLawmaAdminDashboard() {
    return this.superAdminService.getLawmaAdminDashboard();
  }

  async getPspRevenueAnalysis() {
    return this.superAdminService.getPspRevenueAnalysis();
  }


  async getPspRevenueForAdmin(admin: AdminUser, filters?: GetPickupsForPspDto) {
    return this.superAdminService.getPspRevenueForAdmin(admin, filters);
  }
}
