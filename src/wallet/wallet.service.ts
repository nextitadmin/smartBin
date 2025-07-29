import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletStatus } from '@models/wallet.model';
import {
  TopUpWalletDto,
  TopUpWalletResponseDto,
  GetWalletResponseDto,
} from './dtos/wallet.dto';
import * as crypto from 'crypto';
import { Transaction } from '@models/transaction.model';
import { TransactionService } from '../transaction/transaction.service';
import { SuccessResponse } from '@common/http';
import { UserRole } from '@models/types';

@Injectable()
export class WalletService {
  constructor(@InjectModel(Wallet.name) private walletModel: Model<Wallet>) {}

  // Resident
  async getResidentWallet(
    userId: string,
  ): Promise<SuccessResponse<GetWalletResponseDto>> {
    const wallet = await this.walletModel
      .findOne({ userId, userType: 'Resident' })
      .lean();

    if (!wallet) throw new NotFoundException('Wallet not found');

    return new SuccessResponse('Wallet retrieved successfully', {
      ledger_balance: wallet.ledger_balance,
      status: wallet.status,
    });
  }

  async initiateTopup({
    accountId,
    accountType,
    dto,
  }: {
    accountId: string;
    dto: TopUpWalletDto;
    accountType: UserRole;
  }) {
    const { amount } = dto;

    const shortId = crypto.randomBytes(4).toString('hex').toUpperCase();
    const reference = `ALAT-${shortId}`;

    let wallet = await this.walletModel.findOne({
      userId: accountId,
      userType: accountType,
    });

    if (!wallet) {
      wallet = await this.walletModel.create({
        userId: accountId,
        userType: accountType,
        available_balance: 0,
        ledger_balance: 0,
        status: WalletStatus.Active,
      });
    }

    // await this.transactionService.createTransaction({
    //   userId,
    //   userType: 'Resident',
    //   amount,
    //   transactionReference: reference,
    //   transactionID: reference,
    //   status: 'pending',
    //   action: 'wallet_topup',
    //   service: 'Wallet Top-Up',
    //   paymentMethod: 'Alat By Wema',
    //   description: 'Wallet top-up via AlatPay',
    // });

    return {
      reference,
      ...this.getWalletCallback(reference),
    };
  }

  // async verifyTopUp(reference: string) {
  //   const transaction = await verifyAlatTransaction(reference);
  //   if (!transaction) throw new NotFoundException('Transaction not found');

  //   const wallet = await this.walletModel.findOne({ userId: transaction.userId.toString() });
  //   if (!wallet) throw new NotFoundException('Wallet not found');

  //   wallet.available_balance += transaction.amount;
  //   wallet.ledger_balance += transaction.amount;

  //   await wallet.save();

  //   return {
  //     message: 'Transaction verified and wallet credited',
  //     walletBalance: wallet.available_balance,
  //     transaction,
  //   };
  // }

  // to-do :Facility Managers-corporate

  async getWallet(agentId: string): Promise<GetWalletResponseDto> {
    const wallet = await this.walletModel
      .findOne({ userId: new Types.ObjectId(agentId) })
      .lean();
    if (!wallet) throw new NotFoundException('Wallet not found');

    return {
      ledger_balance: wallet.ledger_balance,
      status: wallet.status,
    };
  }

  // async initiateTopUp(userId: string, role: string, dto: TopUpWalletDto) {
  //   const { amount } = dto;

  //   const shortId = crypto.randomBytes(4).toString('hex').toUpperCase();
  //   const reference = `ALAT-${shortId}`;
  //   const userType = role.charAt(0).toUpperCase() + role.slice(1);

  //   let wallet = await this.walletModel.findOne({ userId });
  //   if (!wallet) {
  //     wallet = await this.walletModel.create({
  //       userId,
  //       available_balance: 0,
  //       ledger_balance: 0,
  //     });
  //   }

  //   // create transaction
  //   // await this.transactionService.createTransaction({
  //   //   userId,
  //   //   userType,
  //   //   amount,
  //   //   transactionReference: reference,
  //   //   transactionID: reference,
  //   //   status: 'pending',
  //   //   action: 'wallet_topup',
  //   //   service: 'Wallet Top-Up',
  //   //   paymentMethod: 'Alat By Wema',
  //   //   description: 'Wallet top-up via AlatPay',
  //   // });

  //   const mockPaymentUrl = `${process.env.BASE_URL}/api/wallets/mock-verify?reference=${reference}`;
  //   return { reference, payment_url: mockPaymentUrl };
  // }

  async getWalletCallback(reference: string) {
    const payment_url = `${process.env.BASE_URL}/api/wallets/mock-verify?reference=${reference}`;
    return {
      paymentCallbackUrl: payment_url,
      method: 'GET',
    };
  }

  // async verifyTopUp(reference: string) {
  //   const transaction = await verifyAlatTransaction(reference);
  //   if (!transaction) throw new NotFoundException('Transaction not found');

  //   const wallet = await this.walletModel.findOne({ userId: transaction.userId.toString() });
  //   if (!wallet) throw new NotFoundException('Wallet not found');

  //   wallet.available_balance += transaction.amount;
  //   wallet.ledger_balance += transaction.amount;

  //   await wallet.save();

  //   return {
  //     message: 'Transaction verified and wallet credited',
  //     walletBalance: wallet.available_balance,
  //     transaction,
  //   };
  // }
}
