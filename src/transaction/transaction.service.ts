import { SupportedCurrency, TransactionNarrations } from '@common/constants';
import { generateRandomChars } from '@common/utils';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@models/transaction.model';
import { Wallet } from '@models/wallet.model';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaystackService } from '@src/provider/paystack.service';
import { ProviderService } from '@src/provider/provider.service';
import { Model } from 'mongoose';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Transaction>,
    private readonly paystackService: PaystackService,
  ) {}

  async generateReference({
    customer_id,
    type,
    amount,
    narration,
  }: {
    customer_id: string;
    amount: number;
    type: TransactionType;
    narration?: TransactionNarrations;
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
      narration: narration || TransactionNarrations.WalletTopup,
      type,
    }).save();

    return reference;
  }

  async actionReference({
    customer_id,
    referenceId,
    meta,
    amount,
  }: {
    customer_id: string;
    referenceId: string;
    meta?: any;
    amount?: number;
  }) {
    const wallet = await this.walletModel.findOne({ customer_id });

    console.log('ddd', customer_id);
    const transaction = await this.transactionModel.findOne({
      reference: referenceId,
      status: TransactionStatus.Abandoned,
      customer_id,
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    const isFromProvider = await this.paystackService.verifyTransaction(
      referenceId,
    );
    console.log(isFromProvider);
    if (!isFromProvider) {
      throw new BadRequestException('Invalid transaction');
    }

    transaction.amount = Number(isFromProvider.amount);
    console.log(transaction);
    if (transaction.type === TransactionType.Topup) {
      const walletupdate = await this.walletModel.findByIdAndUpdate(
        wallet._id,
        {
          available_balance: wallet.available_balance + transaction.amount,
          ledger_balance: wallet.available_balance + transaction.amount,
        },
        { new: true },
      );
      await this.transactionModel.findByIdAndUpdate(transaction._id, {
        status: TransactionStatus.Successful,
        available_balance: walletupdate.available_balance,
        ledger_balance: walletupdate.ledger_balance,
        meta: {
          ...meta,
          providerMeta: isFromProvider,
        },
      });
    }
  }

  async createTransaction({ amount, type, customer_id, narration }) {
    const reference = await this.generateReference({
      customer_id,
      amount,
      type,
      narration,
    });

    return reference;
  }

  async getTransaction(query: any) {
    return this.transactionModel.findOne(query);
  }
  async updateTransaction(query: any, update: any) {
    return this.transactionModel.findOneAndUpdate(query, update, { new: true });
  }
}
