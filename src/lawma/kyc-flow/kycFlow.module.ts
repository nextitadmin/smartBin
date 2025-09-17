import { Module } from '@nestjs/common';
import { KycFlowController } from './kycFlow.controller';
import { KycFlowService } from './kycFlow.service';
import { KycModule } from '@src/kyc/kyc.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserKyc, UserKycSchema } from '@models/user-kyc.model';
import { CorporateTeam, CorporateTeamSchema } from '@models/corporate-team.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserKyc.name, schema: UserKycSchema },
      { name: CorporateTeam.name, schema: CorporateTeamSchema}
    ]),
    KycModule,
  ],
  controllers: [KycFlowController],
  providers: [KycFlowService],
})
export class KycFlowModule {}
