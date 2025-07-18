import { Module } from '@nestjs/common';
import { PayerService } from './payer.service';
import { PayerController } from './payer.controller';

@Module({
  controllers: [PayerController],
  providers: [PayerService],
})
export class PayerModule {}
