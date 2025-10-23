import { Module } from '@nestjs/common';
import { WasteManagementController } from './waste-management.controller';
import { LawmaWasteManagementService } from './waste-management.service';
import { PickupModule } from '@src/waste-management/pickup/pickup.module';
import { AuthModule } from '@src/lawma/auth/auth.module';
import { PspModule } from '../psp/psp.module';
import { PspWasteManagementController } from './psp.waste-management.controller';
import { PspTeamWasteManagementController } from './psp-team.waste-management.controller';

@Module({
  imports: [PickupModule, AuthModule,PspModule],
  controllers: [WasteManagementController,PspWasteManagementController,PspTeamWasteManagementController],
  providers: [LawmaWasteManagementService],
})
export class AdminWasteManagementModule {}
