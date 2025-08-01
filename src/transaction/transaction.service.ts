import { generateRandomChars } from '@common/utils';
import {
  ServiceType,
  Transaction,
  TransactionStatus,
} from '@models/transaction.model';
import { UserRole } from '@models/types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { AuthUser } from '@common/types';
import { Paging } from '@common/http';


@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactions: Model<Transaction>,
  ) {}

  async initiateTransaction({
    userId,
    userType,
    amount,
    walletId,
    service,
    reference,
    metadata,
  }: {
    userId: string;
    userType: UserRole;
    amount: number;
    service: ServiceType;
    walletId?: string;
    reference?: string;
    metadata?: Record<string, any>;
  }) {
    if (!reference) {
      reference = `TX-${Date.now()}-${generateRandomChars(
        8,
        'alphanum',
      ).toUpperCase()}`;
    }

    const referenceExists = await this.transactions.exists({ reference });
    if (referenceExists) {
      return {
        success: false,
        message: 'Transaction reference already exists',
      };
    }

    await this.transactions.create({
      userId,
      userType,
      walletId,
      amount,
      transactionReference: reference,
      service,
      status:
        service === ServiceType.WalletCharge
          ? TransactionStatus.Successful
          : TransactionStatus.Abandoned,
      meta: metadata || {},
    });

    return {
      success: true,
      message: 'Transaction initiated successfully',
      data: {
        reference,
      },
    };
  }

  async mockTransactionPaid(reference: string) {
    const transaction = await this.transactions.findOne({
      transactionReference: reference,
    });

    if (!transaction) {
      throw new BadRequestException('Invalid transaction');
    }

    transaction.status = TransactionStatus.Successful;
    transaction.completedAt = new Date();
    await transaction.save();

    return {
      success: true,
      message: 'Transaction marked as paid successfully',
      data: transaction,
    };
  }

  async getTransactions({ user, paging }: { user: AuthUser; paging: Partial<Paging> }) {
    const query = {
      userId: new Types.ObjectId(user.id),
      userType: user.role,
    };
    const limit = paging.size || 10;
    const page = paging.page || 1;
    const totalDocuments = await this.transactions.countDocuments(query);
    const transactions = await this.transactions
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const pagingData = {
      total: totalDocuments,
      page,
      limit,
      pages: Math.ceil(totalDocuments / limit),
    };
    return {
      transactions,
      paging: pagingData,
    };
  }
}