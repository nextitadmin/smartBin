import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { CustomerModule } from '@src/customer/customer.module';
import { ProviderModule } from '@src/provider/provider.module';
import { WalletModule } from '@src/wallet/wallet.module';

@Module({
  imports: [
    CustomerModule,
    ProviderModule,
    WalletModule,
    MongooseModule.forFeature([
      {
        name: Transaction.name,
        schema: TransactionSchema,
      },
      {
        name: Wallet.name,
        schema: WalletSchema,
      },
    ]),
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
