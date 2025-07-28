import { Module } from '@nestjs/common';
import { FacilityManagerService } from './facility-manager.service';
import { FacilityManagerController } from './facility-manager.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FacilityManager,
  FacilityManagerSchema,
} from '@models/users/facility-manager.model';
import { Payer, PayerSchema } from '@models/users/payer.model';
import { SmartBinController } from './smart-bin/smart-bin.controller';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';
import { SmartBinModule } from '@src/smart-bin/smart-bin.module';
import { FacilityController } from './facility/facility.controller';
import { FacilityService } from './facility/facility.service';
import { UserKyc, UserKycSchema } from '@models/user-kyc.model';
import { KycApplicationController } from './kyc-application/kyc-application.controller';
import { KycModule } from '@src/kyc/kyc.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payer.name, schema: PayerSchema },
      { name: FacilityManager.name, schema: FacilityManagerSchema },
      { name: UserKyc.name, schema: UserKycSchema }
    ]),
    SmartBinModule,
    KycModule
  ],
  controllers: [
    FacilityManagerController,
    SmartBinController,
    FacilityController,
    KycApplicationController
  ],
  providers: [FacilityManagerService, FacilityService],
})
export class FacilityManagerModule {}
