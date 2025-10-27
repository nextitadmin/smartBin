import { Module } from '@nestjs/common';
import { SuperAdminReportController } from './super-admin.controller';
import { AdminReportService } from './report.service';
import { ReportModule } from '@src/report/report.module';
import { AuthModule } from '../auth/auth.module';
import { LawmaAdminReportController } from './lawma-admin.report';
import { SmartbinPartnersReportController } from './smartbin-partner.controller';
import { LawmaPartnerModule } from '../lawma-partner/lawma-partner.module';

@Module({
  imports: [ReportModule, AuthModule,LawmaPartnerModule],
  controllers: [
    SuperAdminReportController,
    LawmaAdminReportController,
    SmartbinPartnersReportController,
  ],
  providers: [AdminReportService],
  exports: [AdminReportService],
})
export class LawMaAdminReportModule {}
