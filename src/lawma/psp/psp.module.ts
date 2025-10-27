import { Module } from '@nestjs/common';
import { PspController } from './psp.controller';
import { PspService } from './psp.service';
import { PSP, PSPSchema } from '@models/psp.model';
import { MongooseModule } from '@nestjs/mongoose';
import { PSPMembers, PSPMembersSchema } from '@models/psp-members.model';
import { Lga, LgaSchema } from '@models/lgas.model';
import {
  Administrator,
  AdministratorSchema,
} from '@models/administrator.model';
import { PspAuthController } from './psp-members/auth/auth.controller';
import { PspAuthService } from './psp-members/auth/auth.service';
import { PspWasteManagementController } from '../waste-management/psp.waste-management.controller';
import { LawmaWasteManagementService } from '../waste-management/waste-management.service';
import { PickupModule } from '@src/waste-management/pickup/pickup.module';
import { PSPReportController } from '../report/psp.controller';
import { AdminReportService } from '../report/report.service';
import { ReportModule } from '@src/report/report.module';
import { AuthService } from '../auth/auth.service';
// import { PspTeamManagementController } from './psp-admin/team-management/teamManagement.controller';
// import { PspTeamManagement } from './psp-admin/team-management/teamManagement.service';
import { RbacModule } from '@src/rbac/rbac.module';

@Module({
  controllers: [
    PspController,
    PspAuthController,
    PspWasteManagementController,
    PSPReportController
  ],
  providers: [
    PspService,
    PspAuthService,
    LawmaWasteManagementService,
    AdminReportService,
    AuthService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: PSP.name, schema: PSPSchema },
      { name: PSPMembers.name, schema: PSPMembersSchema },
      { name: Administrator.name, schema: AdministratorSchema },
      { name: Lga.name, schema: LgaSchema },
    ]),
    PickupModule,
    ReportModule,
    RbacModule,
  ],
  exports: [PspAuthService],
})
export class PspModule {}
