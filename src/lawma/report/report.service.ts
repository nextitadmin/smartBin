import { Injectable, NotFoundException } from '@nestjs/common';

import { AdminUser } from '@common/types';
import {
  CreateAdminReportDto,
  GetReportsDto,
} from '@src/report/dtos/report.dto';
import { ReportService } from '@src/report/report.service';

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

  async generatePSPReport(admin: AdminUser, dto: CreateAdminReportDto) {
    return this.reportService.generatePSPReport(admin, dto);
  }

  async getAdminReports(admin: AdminUser, filters: GetReportsDto) {
    return this.reportService.getAdminReports(admin, filters);
  }

  async getAdminReportById(id: string, admin: AdminUser) {
    return this.reportService.getAdminReportById(id, admin);
  }
}
