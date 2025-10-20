import { Module } from '@nestjs/common';
import { SuperAdminReportController } from './super-admin.controller';
import { AdminReportService } from './report.service';
import { ReportModule } from '@src/report/report.module';
import { AuthModule } from '../auth/auth.module';
import { LawmaAdminReportController } from './lawma-admin.report';
import { SmartbinPartnersReportController } from './smartbin-partner.controller';
import { PSPReportController } from './psp.controller';
import { PspModule } from '../psp/psp.module';

@Module({
  imports: [ReportModule, AuthModule,PspModule],
  controllers: [
    SuperAdminReportController,
    LawmaAdminReportController,
    SmartbinPartnersReportController,
    PSPReportController,
  ],
  providers: [AdminReportService],
  exports: [AdminReportService],
})
export class LawMaAdminReportModule {}
