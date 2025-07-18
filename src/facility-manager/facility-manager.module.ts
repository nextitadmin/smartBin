import { Module } from '@nestjs/common';
import { FacilityManagerService } from './facility-manager.service';
import { FacilityManagerController } from './facility-manager.controller';

@Module({
  controllers: [FacilityManagerController],
  providers: [FacilityManagerService],
})
export class FacilityManagerModule {}
