import { Module } from '@nestjs/common';
import { WasteManagementService } from './waste-management.service';
import { WasteManagementController } from './waste-management.controller';
import { PickupModule } from '@src/waste-management/pickup/pickup.module';
import { ResidentModule } from '@src/resident/resident.module';
import { CorporateModule } from '@src/corporate/corporate.module';
import { FacilityManagerModule } from '@src/facility-manager/facility-manager.module';
import { AgentModule } from '@src/agent/agent.module';
import { PickupService } from './pickup/pickup.service';

@Module({
  imports: [
    PickupModule,
    ResidentModule,
    CorporateModule,
    FacilityManagerModule,
    AgentModule,
  ],
  providers: [WasteManagementService],
  controllers: [WasteManagementController],
})
export class WasteManagementModule {}
