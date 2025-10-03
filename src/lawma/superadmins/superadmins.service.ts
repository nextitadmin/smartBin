import { Injectable } from '@nestjs/common';
import { SuperAdminService } from '@src/super-admin/super-admin.service';

@Injectable()
export class LawmaSuperadminsService {
  constructor(private readonly superAdminService: SuperAdminService) {}

  async getSuperAdminDashboard() {
    return this.superAdminService.getSuperAdminDashboard();
  }

  async getRevenueOverview() {
    return this.superAdminService.getRevenueOverview();
  }
}
