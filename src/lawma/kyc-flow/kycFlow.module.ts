import { Module } from '@nestjs/common';
import { KycFlowController } from './kycFlow.controller';
import { KycFlowService } from './kycFlow.service';
import { KycModule } from '@src/kyc/kyc.module';

@Module({
  imports: [
    KycModule,
  ],
  controllers: [KycFlowController],
  providers: [KycFlowService],
})
export class KycFlowModule {}
