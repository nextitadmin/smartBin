import { BadRequestException, Injectable } from '@nestjs/common';
import { FlutterwaveService } from '@src/flutterwave/flutterwave.service';
import { PurchaseBillPayload, ValidateBillAttributes } from './types';
import { generateRandomChars } from '@common/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from '@models/customer.model';
import { Model } from 'mongoose';
import { Wallet } from '@models/wallet.model';
import { ProviderService } from '@src/provider/provider.service';
import { TransactionService } from '@src/transaction/transaction.service';
import { TransactionStatus, TransactionType } from '@models/transaction.model';
import { WalletService } from '@src/wallet/wallet.service';

@Injectable()
export class UtilityService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    private readonly providerService: ProviderService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
  ) {}

  async getBills() {
    return await this.flutterwaveService.getBillCategories();
  }

  async validateBill(payload: ValidateBillAttributes) {
    const response = await this.flutterwaveService.validateCustomerBillDetails({
      // serviceId: 'ibadan-electric',
      billerCode: payload.billCode,
      itemCode: payload.itemCode,
      customer: payload.customerIdentifier,
    });

    return response;
    // const response = await this.flutterwaveService.validateCustomerBillDetails({
    //   // serviceId: 'ibadan-electric',
    //   billerCode: payload.billCode,
    //   itemCode: payload.itemCode,
    //   customer: payload.customerIdentifier,
    // });

    // return {
    //   name: response.Customer_Name,
    //   accountType: response.Customer_Account_Type,
    // };
  }

  async purchaseBill(payload: PurchaseBillPayload) {
    const customer = await this.customerModel
      .findById(payload.customer_id)
      .select('email first_name phone');

    const customerWallet = await this.walletModel.findOne({
      customer_id: payload.customer_id,
    });

    if (!customerWallet || customerWallet.available_balance < payload.amount) {
      throw new BadRequestException('Insufficient funds to complete purchase!');
    }
    const debitAmount = payload.amount;

    // Debit customer wallet
    await this.walletService.debitWallet({
      customer_id: payload.customer_id,
      amount: debitAmount,
      field: 'both_balance',
    });

    const transactionAmount = payload.amount - 15000; // 15000 is transaction fee and in kobo

    const reference = await this.transactionService.createTransaction({
      customer_id: payload.customer_id,
      amount: transactionAmount,
      type: TransactionType.BillPayment,
      narration: 'Bill Payment',
    });

    const billPayload = {
      customer: payload.customerIdentifier,
      amount: transactionAmount / 100,
      itemCode: payload.itemCode,
      billerCode: payload.billCode,
      reference: 'LMOhMT8HZMMQF08L3vK',
    };

    const billResponse = await this.flutterwaveService.initiateBillPayment(
      billPayload,
    );
    if (!billResponse.success) {
      // revert money
      await this.walletService.creditWallet({
        customer_id: payload.customer_id,
        amount: debitAmount,
        field: 'ledger_balance',
      });

      throw new BadRequestException(
        'Unable to complete bill payment, Please try again!',
      );
    }

    return {
      reference,
      token: billResponse.data.recharge_token,
    };
  }

  async generateUtilityToken({
    reference,
    customer_id,
  }: {
    reference: string;
    customer_id: string;
  }) {
    const tokenResponse = await this.flutterwaveService.getBillPaymentStatus({
      reference,
    });
    if (!tokenResponse.success) {
      throw new BadRequestException('Unable to generate bill token!');
    }

    if (tokenResponse.data.extra === null) {
      return {
        ...tokenResponse,
        status: 'pending',
      };
    }
    const transaction = await this.transactionService.getTransaction({
      reference,
      customer_id,
    });

    if (!transaction) {
      throw new BadRequestException(
        'Unable to generate bill token! Please contact support!',
      );
    }

    if (transaction?.meta?.finalResponse) {
      return transaction?.meta?.finalResponse;
    }

    await this.transactionService.updateTransaction(
      {
        _id: transaction._id,
      },
      {
        status: TransactionStatus.Successful,
        meta: {
          ...transaction?.meta,
          finalResponse: tokenResponse.data,
        },
      },
    );

    return tokenResponse.data;
  }
}
