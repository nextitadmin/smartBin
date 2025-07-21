import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resident } from '../models/users/resident.model';
import { DashboardService } from './dashboard.service';

@Controller('test-resident-dashboard')
export class ResidentDashboardTestController {
  constructor(
    @InjectModel('Resident') private residentModel: Model<Resident>,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get()
  async testDashboard() {
    const testResident = await this.residentModel.findOne({ email: 'bukola@example.com' });
    if (!testResident) {
      return { error: 'Test resident not found. Please seed first.' };
    }

 return this.dashboardService.getResidentDashboard(testResident._id.toString());

  }
}
