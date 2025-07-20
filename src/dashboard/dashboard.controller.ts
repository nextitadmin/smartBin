import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
// import { AuthGuard } from '../auth/auth.guard'; 

@Controller('dashboard')
// @UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@Req() req) {
    const { userId, userType } = req.user;

    switch (userType) {
      case 'Resident':
        return this.dashboardService.getResidentDashboard(userId);

      case 'Facility':
        return this.dashboardService.getFacilityDashboard(userId);

      case 'Agent':
        return this.dashboardService.getAgentDashboard(userId);

      case 'Corporate':
        return this.dashboardService.getCorporateDashboard(userId);

      default:
        return {
          message: 'Unknown user type. Cannot fetch dashboard.',
        };
    }
  }
}
