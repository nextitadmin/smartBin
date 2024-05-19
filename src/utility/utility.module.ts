import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { FlutterwaveModule } from '@src/flutterwave/flutterwave.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from '@models/customer.model';
import { CustomerModule } from '@src/customer/customer.module';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { ProvidersModule } from '@src/providers/providers.module';
import { TransactionModule } from '@src/transaction/transaction.module';
import { WalletModule } from '@src/wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Customer.name,
        schema: CustomerSchema,
      },
      {
        name: Wallet.name,
        schema: WalletSchema,
      },
    ]),
    CustomerModule,
    FlutterwaveModule,
    ProvidersModule,
    TransactionModule,
    WalletModule,
  ],
  controllers: [UtilityController],
  providers: [UtilityService],
})
export class UtilityModule {}
