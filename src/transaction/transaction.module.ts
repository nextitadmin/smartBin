import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { CustomerModule } from '@src/customer/customer.module';

@Module({
  imports: [
    CustomerModule,
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
})
export class TransactionModule {}
