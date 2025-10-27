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
import {SmartbinPartnerUser} from '@common/types';
import { SmartbinPartnerAuth, AuthenticatedSmartbinPartner} from '@common/decorators/auth.decorator';

@ApiTags('Smartbin-Partners/Report')
@Controller({
  path: 'lawma/smartbin-partners/reports',
  version: '1',
})
@SmartbinPartnerAuth()
export class SmartbinPartnersReportController {
  constructor(private readonly reportService: AdminReportService) {}

  @Post('report')
  async createReport(
    @AuthenticatedSmartbinPartner() admin: SmartbinPartnerUser,
    @Body() dto: CreateAdminReportDto,
  ) {
    const data = await this.reportService.generateSmartbinPartnerReport(
      admin,
      dto,
    );
    return data;
  }

  @Get()
  async getReports(
    @AuthenticatedSmartbinPartner() admin: SmartbinPartnerUser,
    @Query() filters: GetReportsDto,
  ) {
    const reports = await this.reportService.getSmartbinPartnerReports(admin, filters);
    return new SuccessResponse('Reports retrieved successfully', reports);
  }

  @Get(':id')
  async getReportById(
    @AuthenticatedSmartbinPartner() admin:SmartbinPartnerUser,
    @Param('id') id: string,
  ) {
    const report = await this.reportService.getSmartbinPartnerReportById(id, admin);
    return new SuccessResponse('Report retrieved successfully', report);
  }
}
