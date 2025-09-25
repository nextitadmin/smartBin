import { Module } from '@nestjs/common';
import { SuperadminsModule } from './superadmins/superadmins.module';
import { PspModule } from './psp/psp.module';
import { UsersModule as LawmaUserManagementModule } from './user-management/user-management.module';
import { LawmaSmartbinsModule } from './smartbins/smartbins.module';
import { KycFlowModule } from './kyc-flow/kycFlow.module';
import { AuditLogModule } from './audit-log/auditLog.module';
import { LawmaPartnerModule } from './lawma-partner/lawma-partner.module';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { AdminReportController } from './admin.controller';
import { ReportModule } from '@src/report/report.module';
import { AdminWasteManagementModule } from './waste-management/waste-management.module';

@Module({
  imports: [
    SuperadminsModule,
    PspModule,
    LawmaUserManagementModule,
    LawmaSmartbinsModule,
    KycFlowModule,
    AuditLogModule,
    LawmaPartnerModule,
    AuthModule,
    TeamModule,
    ReportModule,
    AdminWasteManagementModule
  ],
controllers:[
  AdminReportController
]
})
export class LawmaModule {}
