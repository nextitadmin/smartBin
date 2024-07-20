import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { Wallet, WalletSchema } from '@models/wallet.model';
import { CustomerModule } from '@src/customer/customer.module';
import { ProvidersModule } from '@src/providers/providers.module';
import { WalletModule } from '@src/wallet/wallet.module';
import { TransactionWorker } from './transaction.worker';
import { Commission, CommissionSchema } from '@models/commission.model';

@Module({
  imports: [
    CustomerModule,
    ProvidersModule,
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
      {
        name: Commission.name,
        schema: CommissionSchema,
      },
    ]),
  ],
  providers: [TransactionService, TransactionWorker],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
