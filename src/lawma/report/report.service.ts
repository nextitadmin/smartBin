import { Injectable, NotFoundException } from '@nestjs/common';

import { AdminUser, PspUser } from '@common/types';
import {
  CreateAdminReportDto,GetReportsDto,
} from '@src/report/dtos/report.dto';
import { ReportService } from '@src/report/report.service';
import { PspTeamMember } from '@common/types';


@Injectable()
export class AdminReportService {
  constructor(private readonly reportService: ReportService) {}

  async generateSuperAdminReport(admin: AdminUser, dto: CreateAdminReportDto) {
    return this.reportService.generateAdminReport(admin, dto);
  }

  async generateLawmaAdminReport(admin: AdminUser, dto: CreateAdminReportDto) {
    return this.reportService.generateAdminReport(admin, dto);
  }

  async generateSmartbinPartnerReport(
    admin: AdminUser,
    dto: CreateAdminReportDto,
  ) {
    return this.reportService.generateSmartbinPartnerReport(admin, dto);
  }

  async generatePSPReport(admin: PspUser, dto: CreateAdminReportDto) {
    return this.reportService.generatePSPReport(admin, dto);
  }

  async generatePspTeamMemberReport(teamMember: PspTeamMember, dto: CreateAdminReportDto) {
    return this.reportService.generatePspTeamMemberReport(teamMember, dto);
  }


  async getAdminReports(admin: AdminUser, filters: GetReportsDto) {
    return this.reportService.getAdminReports(admin, filters);
  }

async  getPspReports(admin: PspUser, filters: GetReportsDto) {
    return this.reportService.getPspReports(admin, filters);
  }

async getPspTeamMemberReports(teamMember: PspTeamMember, filters: GetReportsDto) {
    return this.reportService.getPspTeamMemberReports(teamMember, filters);
  }

  async getPspTeamMemberReportById(id: string, teamMember: PspTeamMember) {
    return this.reportService.getPspTeamMemberReportById(id, teamMember);
  }

  async getPspReportById(id: string, admin: PspUser) {
    return this.reportService.getPspReportById(id, admin);
  }
  async getAdminReportById(id: string, admin: PspUser) {
    return this.reportService.getAdminReportById(id, admin);
  }
}
