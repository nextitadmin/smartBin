import { SupportedCurrency, TransactionNarrations } from '@common/constants';
import { generateRandomChars } from '@common/utils';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@models/transaction.model';
import { Wallet } from '@models/wallet.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Transaction>,
  ) {}

  async generateReference({
    customer_id,
    type,
    amount,
  }: {
    customer_id: string;
    amount: number;
    type: TransactionType;
  }) {
    const reference = `LMO${generateRandomChars(16)}`;

    const wallet_id = await this.walletModel
      .findOne({ customer_id })
      .select('_id');

    await new this.transactionModel({
      customer_id,
      currency: SupportedCurrency.NGN,
      reference,
      amount,
      wallet_id: wallet_id._id,
      narration: TransactionNarrations.WalletTopup,
      type,
    }).save();

    return reference;
  }

  async actionReference({
    customer_id,
    referenceId,
  }: {
    customer_id: string;
    referenceId: string;
  }) {
    const wallet_id = await this.walletModel
      .findOne({ customer_id })
      .select('_id');

    const transaction = await this.transactionModel.findOne({
      reference: referenceId,
      status: TransactionStatus.Abandoned,
      customer_id,
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.type === TransactionType.Topup) {
      const walletupdate = await this.walletModel.findByIdAndUpdate(
        transaction.wallet_id,
        {
          customer_id,
        },
        { new: true },
      );
      await this.transactionModel.findByIdAndUpdate(transaction._id, {
        status: TransactionStatus.Successful,
        available_balance: walletupdate.available_balance,
        ledger_balance: walletupdate.ledger_balance,
      });
    }
  }
}
