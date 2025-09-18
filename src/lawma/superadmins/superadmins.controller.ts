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
    getDSashboard() {
      return this.superAdminService.getSuperAdminDashboard(new Date().getFullYear());
    }

    @Get('revenue-overview')
    getRevenueOverview() {
      return this.superAdminService.getRevenueOverview(new Date().getFullYear());
    }
}
