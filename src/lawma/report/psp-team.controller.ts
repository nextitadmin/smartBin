import { Controller, Post, Get, Param, Query, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportType } from '@models/report.model';
import { Types } from 'mongoose';
import { AdminReportService } from './report.service';
import {
  CreateAdminReportDto,
  GetReportsDto,
} from '@src/report/dtos/report.dto';
import { SuccessResponse } from '@common/http';
import { PspTeamMember } from '@common/types';
import {PspTeamMemberAuth,AuthenticatedPspTeamMember} from '@common/decorators/auth.decorator';


@ApiTags('PSP-Team-Member/Report')
@Controller({
  path: '/psp/team-member/reports',
  version: '1',
})
@PspTeamMemberAuth()
export class PSPTeamMemberReportController {
  constructor(private readonly reportService: AdminReportService) {}

  @Post('report')
  async createReport(
    @AuthenticatedPspTeamMember() admin: PspTeamMember,
    @Body() dto: CreateAdminReportDto,
  ) {
    const data = await this.reportService.generatePspTeamMemberReport(admin, dto);
    return data;
  }

  @Get()
  async getReports(
    @AuthenticatedPspTeamMember() admin: PspTeamMember,
    @Query() filters: GetReportsDto,
  ) {
    const reports = await this.reportService.getPspTeamMemberReports(admin, filters);
    return new SuccessResponse('Reports retrieved successfully', reports);
  }

  @Get(':id')
  async getReportById(
    @AuthenticatedPspTeamMember() admin: PspTeamMember,
    @Param('id') id: string,
  ) {
    const report = await this.reportService.getPspTeamMemberReportById(id, admin);
    return new SuccessResponse('Report retrieved successfully', report);
  }
}
