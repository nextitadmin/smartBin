import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CorporateModule } from '@src/corporate/corporate.module';
import { AgentModule } from '@src/agent/agent.module';
import { FacilityManagerModule } from '@src/facility-manager/facility-manager.module';
import { ResidentModule } from '@src/resident/resident.module';

@Module({
  imports: [
    CorporateModule,
    AgentModule,
    FacilityManagerModule,
    ResidentModule,
  ],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
