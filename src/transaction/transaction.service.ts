import { SupportedCurrency, TransactionNarrations } from '@common/constants';
import { generateRandomChars } from '@common/utils';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@models/transaction.model';
import { Wallet } from '@models/wallet.model';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaystackService } from '@src/providers/paystack.service';
import { WalletService } from '@src/wallet/wallet.service';
import { Model } from 'mongoose';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Transaction>,
    private readonly paystackService: PaystackService,
    private readonly walletService: WalletService,
  ) {}

  private logger = new Logger(TransactionService.name);

  async generateReference({
    customer_id,
    type,
    amount,
    reference,
    narration,
  }: {
    customer_id: string;
    amount: number;
    type: TransactionType;
    reference?: string;
    narration?: TransactionNarrations;
  }) {
    let transactionReference = `LMO${generateRandomChars(24)}`.toUpperCase();

    if (reference) {
      transactionReference = reference;
    }

    const wallet_id = await this.walletModel
      .findOne({ customer_id })
      .select('_id');

    await new this.transactionModel({
      customer_id,
      currency: SupportedCurrency.NGN,
      reference: transactionReference,
      amount,
      wallet_id: wallet_id._id,
      narration: narration || TransactionNarrations.WalletTopup,
      type,
    }).save();

    return transactionReference;
  }

  async actionReference({
    referenceId,
    meta,
  }: {
    referenceId: string;
    meta?: any;
  }) {
    const transaction = await this.transactionModel.findOne({
      reference: referenceId,
      status: TransactionStatus.Abandoned,
    });

    if (!transaction) {
      this.logger.error('Transaction not found');
      return {
        success: false,
      };
    }

    const isFromProvider = await this.paystackService.verifyTransaction(
      referenceId,
    );
    if (!isFromProvider) {
      throw new BadRequestException('Invalid transaction');
    }

    transaction.amount = Number(isFromProvider.amount);
    if (transaction.type === TransactionType.Topup) {
      await this.walletService.creditWallet({
        customer_id: transaction.customer_id,
        amount: Number(isFromProvider.amount - 10000),
      });

      const walletupdate = await this.walletModel.findById(
        transaction.wallet_id,
      );
      await this.transactionModel.findByIdAndUpdate(transaction._id, {
        status: TransactionStatus.Successful,
        available_balance: walletupdate.available_balance,
        ledger_balance: walletupdate.ledger_balance,
        amount: transaction.amount,
        meta: {
          ...meta,
          providerMeta: isFromProvider,
        },
      });
    }
  }

  async createTransaction({ amount, type, customer_id, narration, reference }) {
    const transactionReference = await this.generateReference({
      customer_id,
      amount,
      type,
      narration,
      reference,
    });

    return transactionReference;
  }

  async getTransaction(query: any) {
    return this.transactionModel.findOne(query);
  }

  async updateTransaction(query: any, update: any) {
    return this.transactionModel.findOneAndUpdate(query, update, { new: true });
  }

  async getCustomerTransactions({ customer_id }) {
    return this.transactionModel
      .find({
        customer_id,
        status: { $ne: TransactionStatus.Abandoned },
      })
      .sort({
        createdAt: -1,
      });
  }
}
