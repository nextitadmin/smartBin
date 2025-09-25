import { Module, Res } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamMember, TeamMemberSchema } from '@models/team.model';
import { FacilityManagerModule } from '@src/facility-manager/facility-manager.module';
import { AgentModule } from '@src/agent/agent.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { ResidentModule } from '@src/resident/resident.module';

import { CorporateModule } from '@src/corporate/corporate.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeamMember.name, schema: TeamMemberSchema },
    ]),
    ResidentModule,
    FacilityManagerModule,
    AgentModule,
    CorporateModule,
  ],
  controllers: [TeamController],
  exports: [TeamService],
  providers: [TeamService],
})
export class TeamModule {}
