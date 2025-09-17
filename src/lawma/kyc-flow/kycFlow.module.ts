import { Module } from '@nestjs/common';
import { KycFlowController } from './kycFlow.controller';
import { KycFlowService } from './kycFlow.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [],
  controllers: [KycFlowController],
  providers: [KycFlowService],
})
export class KycFlowModule {}
