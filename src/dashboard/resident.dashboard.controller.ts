
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ResidentAuthGuard } from '../common/guards/resident.guard';
import { SuccessResponse } from '@common/http';

@Controller({
    path: 'dashboard/resident',
    version: '1',
})
@UseGuards(ResidentAuthGuard)
export class ResidentDashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    async getResidentDashboard(@Req() req) {
        const userId = req.user.id;
        const data = this.dashboardService.getResidentDashboard(userId);
        return new SuccessResponse('Resident Dashboard retrieved', data)
    }
}
