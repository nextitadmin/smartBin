import { Module } from '@nestjs/common';
import { WasteManagementService } from './waste-management.service';
import { PickupService } from './pickup/pickup.service';
import { PickupController } from './pickup/pickup.controller';
import { WasteManagementController } from './waste-management.controller';

@Module({
  providers: [WasteManagementService, PickupService],
  controllers: [PickupController, WasteManagementController]
})
export class WasteManagementModule {}
