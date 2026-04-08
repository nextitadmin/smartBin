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
import {PspUserAuth, AuthenticatedPspUser,AuthenticatedPspTeamMember} from '@common/decorators/auth.decorator';
import { AdminUser, PspTeamMember, PspUser } from '@common/types';

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
    @AuthenticatedPspUser() admin: PspUser & AdminUser,
    @Param('id') id: string,
  ) {
    const report = await this.reportService.getAdminReportById(id, admin);
    return new SuccessResponse('Report retrieved successfully', report);
  }


  @Post('team-member-report')
  async createTeamMemberReport(
    @AuthenticatedPspTeamMember() teamMember: PspTeamMember,
    @Body() dto: CreateAdminReportDto,
  ) {
    const data = await this.reportService.generatePspTeamMemberReport(teamMember, dto);
    return data;
}

@Get('team-member-reports')
async getTeamMemberReports(
  @AuthenticatedPspTeamMember() teamMember: PspTeamMember,
  @Query() filters: GetReportsDto,
) {
  const reports = await this.reportService.getPspTeamMemberReports(teamMember, filters);
  return new SuccessResponse('Reports retrieved successfully', reports);

}

@Get('team-member-reports/:id')
async getTeamMemberReportById(
  @AuthenticatedPspTeamMember() teamMember: PspTeamMember,
  @Param('id') id: string,
) {
  const report = await this.reportService.getPspTeamMemberReportById(id, teamMember);
  return new SuccessResponse('Report retrieved successfully', report);
}

}
