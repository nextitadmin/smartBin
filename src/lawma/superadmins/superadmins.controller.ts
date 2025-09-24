import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LawmaSuperadminsService } from './superadmins.service';
import { SuperAdminService } from '@src/super-admin/super-admin.service';

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

}
