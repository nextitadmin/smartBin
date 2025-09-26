import { Module } from '@nestjs/common';
import { WasteManagementController } from './waste-management.controller';
import { LawmaWasteManagementService } from './waste-management.service';
import { PickupModule } from '@src/waste-management/pickup/pickup.module';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PickupModule, AuthModule],
  controllers: [WasteManagementController],
  providers: [LawmaWasteManagementService],
})
export class AdminWasteManagementModule {}
