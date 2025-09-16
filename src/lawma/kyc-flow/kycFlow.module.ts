import { Module } from '@nestjs/common';
import { KycFlowController } from './kycFlow.controller';
import { KycFlowService } from './kycFlow.service';

@Module({
  imports: [],
  controllers: [KycFlowController],
  providers: [KycFlowService],
})
export class KycFlowModule {}
