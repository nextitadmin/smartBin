import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@models/transaction.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { subHours } from 'date-fns';
import { Model } from 'mongoose';

@Injectable()
export class TransactionWorker {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async clearAbandonedTransactions() {
    const oneHourAgo = subHours(new Date(), 1).toISOString();

    await this.transactionModel.deleteMany({
      status: TransactionStatus.Abandoned,
      createdAt: { $lte: oneHourAgo },
      type: { $in: [TransactionType.Topup] },
    });
  }
}
