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
import { AuthModule } from '../auth/auth.module';
import { PspAuthController } from './auth/auth.controller';
import { PspAuthService } from './auth/auth.service';
import { PspTeamManagementController } from './team-management/teamManagement.controller';
import { PspTeamManagement } from './team-management/teamManagement.service';

@Module({
  controllers: [PspController, PspAuthController, PspTeamManagementController],
  providers: [PspService, PspAuthService, PspTeamManagement],
  imports: [
    MongooseModule.forFeature([
      { name: PSP.name, schema: PSPSchema },
      { name: PSPMembers.name, schema: PSPMembersSchema },
      { name: Administrator.name, schema: AdministratorSchema },
      { name: Lga.name, schema: LgaSchema },
    ]),
    AuthModule,
  ],
})
export class PspModule {}
