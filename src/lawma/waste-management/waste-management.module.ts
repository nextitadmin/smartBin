import { Module } from '@nestjs/common';
import { WasteManagementController } from './waste-management.controller';
import { LawmaWasteManagementService } from './waste-management.service';
import { PickupModule } from '@src/waste-management/pickup/pickup.module';

import { AuthModule } from '../auth/auth.module';
import { PspWasteManagementController } from './psp.waste-management.controller';
import { PspModule } from '../psp/psp.module';

@Module({
  imports: [PickupModule, AuthModule,PspModule],
  controllers: [WasteManagementController,PspWasteManagementController],
  providers: [LawmaWasteManagementService],
})
export class AdminWasteManagementModule {}
