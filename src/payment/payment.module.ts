import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { FlutterwaveModule } from '../flutterwave/flutterwave.module';

@Module({
  providers: [PaymentService],
})
export class PaymentModule {}
