import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Resident } from '../models/users/resident.model';
import { Model } from 'mongoose';
import { SuccessResponse } from '@common/http';
// import { AuthGuard } from '../auth/auth.guard';

@Controller({
  path: 'dashboard',
  version: '1',
})
// @UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  private readonly residentModel: Model<Resident>;

  @Get()
  async getDashboard(@Req() req) {
    const { userId, userType } = req.user;

    switch (userType) {
      case 'Resident':
        return this.dashboardService.getResidentDashboard(userId);

      case 'Facility':
        return this.dashboardService.getFacilityManagerDashboard(userId);

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

  @Get('test-dashboard')
  async testDashboard() {
    const testResident = await this.residentModel.findOne({
      email: 'test@example.com',
    }); // Use actual test data
    const response = await this.dashboardService.getResidentDashboard(
      testResident._id.toString(),
    );
    return new SuccessResponse('dashboard', response);
  }
}
