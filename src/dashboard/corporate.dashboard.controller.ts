import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service'
import { CorporateAuthGuard } from '../common/guards/corporate.guard';



@Controller('dashboard/corporate')
@UseGuards(CorporateAuthGuard)
export class CorporateDashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    async getCorporateDashboard(@Req() req) {
        const userId = req.user.id;
        return this.dashboardService.getCorporateDashboard(userId);
    }
}
