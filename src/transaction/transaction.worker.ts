import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@models/transaction.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';

@Injectable()
export class TransactionWorker {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async clearAbandonedTransactions() {
    await this.transactionModel.deleteMany({
      status: TransactionStatus.Abandoned,
      type: { $in: [TransactionType.Topup] },
    });
  }
}
