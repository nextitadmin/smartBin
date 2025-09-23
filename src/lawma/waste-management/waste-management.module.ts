import { Module } from '@nestjs/common';
import { WasteManagementController } from './waste-management.controller';
import { LawmaWasteManagementService } from './waste-management.service';

@Module({
  controllers: [WasteManagementController],
  providers: [LawmaWasteManagementService]
})
export class WasteManagementModule {}
