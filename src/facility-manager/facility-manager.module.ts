import { Module } from '@nestjs/common';
import { FacilityManagerService } from './facility-manager.service';
import { FacilityManagerController } from './facility-manager.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FacilityManager,
  FacilityManagerSchema,
} from '@models/users/facility-manager.model';
import { Payer, PayerSchema } from '@models/users/payer.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payer.name, schema: PayerSchema },
      { name: FacilityManager.name, schema: FacilityManagerSchema },
    ]),
  ],
  controllers: [FacilityManagerController],
  providers: [FacilityManagerService],
})
export class FacilityManagerModule {}
