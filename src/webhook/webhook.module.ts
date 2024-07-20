import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { Wallet, WalletSchema } from '../models/wallet.model';
import { Customer, CustomerSchema } from '../models/customer.model';
import { MongooseModule } from '@nestjs/mongoose';
import { PaystackService } from '@src/providers/paystack.service';
import { ProvidersModule } from '@src/providers/providers.module';
import { TransactionModule } from '@src/transaction/transaction.module';
import {
  WebhookRequest,
  WebhookRequestSchema,
} from '@models/webhook-request.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: WebhookRequest.name, schema: WebhookRequestSchema },
    ]),
    ProvidersModule,
    TransactionModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
