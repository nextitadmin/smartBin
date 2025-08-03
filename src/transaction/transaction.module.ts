import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionWorker } from './transaction.worker';
import { Transaction, TransactionSchema } from '@models/transaction.model';
import { MongooseModule } from '@nestjs/mongoose';
import { PayerModule } from '@src/payer/payer.module';

@Module({
  imports: [
    // CustomerModule,
    // ProvidersModule,
    // WalletModule,
    MongooseModule.forFeature([
      {
        name: Transaction.name,
        schema: TransactionSchema,
      },
      //     {
      //       name: Wallet.name,
      //       schema: WalletSchema,
      //     },
      //     {
      //       name: Commission.name,
      //       schema: CommissionSchema,
      //     },
    ]),
    forwardRef(() => PayerModule),
  ],
  providers: [TransactionService, TransactionWorker],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
