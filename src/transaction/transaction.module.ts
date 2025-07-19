import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionWorker } from './transaction.worker';

@Module({
  // imports: [
  //   CustomerModule,
  //   ProvidersModule,
  //   WalletModule,
  //   MongooseModule.forFeature([
  //     {
  //       name: Transaction.name,
  //       schema: TransactionSchema,
  //     },
  //     {
  //       name: Wallet.name,
  //       schema: WalletSchema,
  //     },
  //     {
  //       name: Commission.name,
  //       schema: CommissionSchema,
  //     },
  //   ]),
  // ],
  providers: [TransactionService, TransactionWorker],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
