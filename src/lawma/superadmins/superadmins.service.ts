import { Injectable } from '@nestjs/common';
import { SuperAdminService } from '@src/super-admin/super-admin.service';

@Injectable()
export class LawmaSuperadminsService {
    constructor(private readonly superAdminService: SuperAdminService) {}
    
    async getSuperAdminDashboard(year: number) {
        return this.superAdminService.getSuperAdminDashboard(year);
    }
    
    async getRevenueOverview(year: number) {
        return this.superAdminService.getRevenueOverview(year);
    }
}
