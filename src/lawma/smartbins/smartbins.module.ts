import { Module } from '@nestjs/common';
import { SmartbinsController } from './smartbins.controller';
import { SmartBinModule } from '@src/smart-bin/smart-bin.module';
import { FacilityManagerModule } from '@src/facility-manager/facility-manager.module';
import { ResidentModule } from '@src/resident/resident.module';
import { CorporateModule } from '@src/corporate/corporate.module';
import { AgentModule } from '@src/agent/agent.module';
import { LawmaSmartbinsService } from './smartbins.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SmartBinModule,
    FacilityManagerModule,
    ResidentModule,
    CorporateModule,
    AgentModule,
    AuthModule
  ],
  controllers: [SmartbinsController],
  providers: [LawmaSmartbinsService],
})
export class LawmaSmartbinsModule {}
