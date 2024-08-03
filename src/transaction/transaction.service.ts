import {
  events,
  SupportedCurrency,
  TransactionNarrations,
} from '@common/constants';
import { generateRandomChars } from '@common/utils';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@models/transaction.model';
import { Wallet } from '@models/wallet.model';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { PaystackService } from '@src/providers/paystack.service';
import { WalletService } from '@src/wallet/wallet.service';
import mongoose, { ClientSession, Model } from 'mongoose';
import { TransactionEvent } from './dto/transaction.dto';
import { Commission } from '@models/commission.model';
import { Money, toSubUnit } from '@common/utils/money';

@Injectable()
export class TransactionService {
  constructor(
    @InjectConnection() private readonly dbConnection: mongoose.Connection,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Transaction>,
    @InjectModel(Commission.name)
    private readonly commission: Model<Commission>,
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

    if (transaction.type === TransactionType.Topup) {
      const isFromProvider = await this.paystackService.verifyTransaction(
        referenceId,
      );
      if (!isFromProvider) {
        throw new BadRequestException('Invalid transaction');
      }
      transaction.amount = Number(isFromProvider.amount);
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
    if (transaction.type === TransactionType.BillPayment) {
      return this.updateTransaction({ reference: referenceId }, meta);
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

  async updateTransaction(query: any, update: any, session?: ClientSession) {
    return this.transactionModel
      .findOneAndUpdate(query, update, { new: true })
      .session(session);
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

  @OnEvent(events.transactions.updated)
  async handleTransactionUpdated(event: TransactionEvent) {
    const { reference, data } = event.data;
    const updatePayload = {
      meta: data,
      status: TransactionStatus.Successful,
    };

    const [transaction, feeTransaction] = await this.transactionModel.find({
      reference,
    });
    if (transaction.status !== TransactionStatus.Pending) {
      return this.logger.log('Transaction already processed');
    }

    if (data.content.transactions.status === 'reversed') {
      updatePayload.status = TransactionStatus.Failed;
    }

    const session = await this.dbConnection.startSession();
    await session.withTransaction(async () => {
      try {
        await this.updateTransaction(
          { reference, type: TransactionType.BillPayment },
          updatePayload,
          session,
        );
        if (updatePayload.status === TransactionStatus.Successful) {
          const commission = toSubUnit(data.content.transactions.commission);
          await new this.commission({
            transactionReference: reference,
            amount: commission,
          }).save({ session });
        }

        if (updatePayload.status === TransactionStatus.Failed) {
          await this.walletService.creditWallet({
            customer_id: transaction.customer_id,
            amount: transaction.amount + feeTransaction.amount,
            field: 'both_balance',
            session,
          });

          await this.updateTransaction(
            { reference, type: TransactionType.Fee },
            {
              status: TransactionStatus.Failed,
            },
            session,
          );
        }
      } catch (error) {
        this.logger.error(error);
        throw error;
      }
    });
    return this.logger.log('Transaction updated event received and processed', {
      reference,
    });
  }
}
