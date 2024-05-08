import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { FlutterwaveModule } from '@src/flutterwave/flutterwave.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from '@models/customer.model';
import { CustomerModule } from '@src/customer/customer.module';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { ProviderModule } from '@src/provider/provider.module';
import { ProviderService } from '@src/provider/provider.service';
import { TransactionModule } from '@src/transaction/transaction.module';

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
    ProviderModule,
    TransactionModule,
  ],
  controllers: [UtilityController],
  providers: [UtilityService],
})
export class UtilityModule {}
