import { Controller, Post, Get, Param, Query, Body } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportType } from '@models/report.model';
import { Types } from 'mongoose';
import { ReportService } from '@src/report/report.service';
import { AdminReportService } from './report.service';
import {
  CreateAdminReportDto,
  GetReportsDto,
} from '@src/report/dtos/report.dto';
import { SuccessResponse } from '@common/http';
import {
  AdminAuth,
  AuthenticatedAdmin,
} from '@common/decorators/auth.decorator';
import {PspUserAuth, AuthenticatedPspUser} from '@common/decorators/auth.decorator';
import { AdminUser, PspUser } from '@common/types';

@ApiTags('PSP/Report')
@Controller({
  path: 'lawma/psp/reports',
  version: '1',
})
@PspUserAuth()
export class PSPReportController {
  constructor(private readonly reportService: AdminReportService) {}

  @Post('report')
  async createReport(
    @AuthenticatedPspUser() admin: PspUser,
    @Body() dto: CreateAdminReportDto,
  ) {
    const data = await this.reportService.generatePSPReport(admin, dto);
    return data;
  }

  @Get()
  async getReports(
    @AuthenticatedPspUser() admin: PspUser,
    @Query() filters: GetReportsDto,
  ) {
    const reports = await this.reportService.getPspReports(admin, filters);
    return new SuccessResponse('Reports retrieved successfully', reports);
  }

  @Get(':id')
  async getReportById(
    @AuthenticatedPspUser() admin: PspUser,
    @Param('id') id: string,
  ) {
    const report = await this.reportService.getAdminReportById(id, admin);
    return new SuccessResponse('Report retrieved successfully', report);
  }
}
