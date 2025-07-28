import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resident, ResidentSchema } from '@models/users/resident.model';
import { UserKyc, UserKycSchema } from '@models/user-kyc.model';
import { KycService } from './kyc.service';
import { FacilityManager, FacilityManagerSchema } from '@models/users/facility-manager.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserKyc.name, schema: UserKycSchema },
      { name: Resident.name, schema: ResidentSchema },
      { name: FacilityManager.name, schema: FacilityManagerSchema}
    ])
  ],
  controllers: [],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
