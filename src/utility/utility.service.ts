import { BadRequestException, Injectable } from '@nestjs/common';
import { FlutterwaveService } from '@src/flutterwave/flutterwave.service';
import { PurchaseBillPayload, ValidateBillAttributes } from './types';
import { generateRandomChars } from '@common/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from '@models/customer.model';
import { Model } from 'mongoose';
import { Wallet } from '@models/wallet.model';
import { VTPassService } from '@src/providers/vtpass.service';
import { TransactionService } from '@src/transaction/transaction.service';
import { TransactionStatus, TransactionType } from '@models/transaction.model';
import { WalletService } from '@src/wallet/wallet.service';
import { ProvidersService } from '@src/providers/providers.service';
import { format } from 'date-fns';

@Injectable()
export class UtilityService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    private readonly providersService: ProvidersService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
  ) {}

  async getBills() {
    return await this.flutterwaveService.getBillCategories();
  }

  async validateBill(payload: ValidateBillAttributes) {
    // VTPASS
    // const response = await this.providersService.validateUtility({
    //   serviceId: 'ibadan-electric',
    //   customerId: payload.customerIdentifier,
    // });

    // return {
    //   ...response
    // };

    // Flutterwave validation
    const response = await this.flutterwaveService.validateCustomerBillDetails({
      // serviceId: 'ibadan-electric',
      billerCode: payload.billCode,
      itemCode: payload.itemCode,
      customer: payload.customerIdentifier,
    });
    console.log(response);
    return {
      Customer_Name: response.name,
    };
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
    const feeAmount = 10000; // 15000 is transaction fee and in kobo
    await this.walletService.debitWallet({
      customer_id: payload.customer_id,
      amount: feeAmount,
      field: 'both_balance',
    });

    const utilityReference = `${format(
      new Date(),
      'yyyyMMddHHmm',
    )}${generateRandomChars(24)}`.toUpperCase();
    const reference = await this.transactionService.createTransaction({
      customer_id: payload.customer_id,
      amount: payload.amount,
      type: TransactionType.BillPayment,
      narration: 'Bill Payment',
      reference: utilityReference,
    });
    await this.transactionService.createTransaction({
      customer_id: payload.customer_id,
      amount: feeAmount,
      type: TransactionType.Fee,
      narration: 'Bill Payment Fee',
      reference: utilityReference,
    });

    const billPayload = {
      customer: payload.customerIdentifier,
      amount: payload.amount / 100,
      itemCode: payload.itemCode,
      billerCode: payload.billCode,
      reference,
    };

    const billResponse = await this.providersService.purchaseUtility({
      customerId: billPayload.customer,
      serviceId: 'ibadan-electric',
      amount: billPayload.amount,
      phone: customer.phone,
      reference,
    });

    if (!billResponse.success) {
      // revert money
      await this.walletService.creditWallet({
        customer_id: payload.customer_id,
        amount: debitAmount,
        field: 'both_balance',
      });

      throw new BadRequestException(
        'Unable to complete bill payment, Please try again!',
      );
    }

    const wallet = await this.walletModel.findById(customerWallet._id);
    await this.transactionService.updateTransaction(
      {
        reference,
      },
      {
        status: TransactionStatus.Successful,
        available_balance: wallet.available_balance,
        ledger_balance: wallet.ledger_balance,
        meta: billResponse.data.meta,
      },
    );
    // Create beneficiary

    console.log(billResponse.data);

    return billResponse.data.reference;
  }

  async generateUtilityToken({
    reference,
    customer_id,
  }: {
    reference: string;
    customer_id: string;
  }) {
    const transaction = await this.transactionService.getTransaction({
      reference,
      customer_id,
    });

    if (!transaction) {
      throw new BadRequestException(
        'Unable to generate bill token! Please contact support!',
      );
    }

    if (transaction.meta !== null) {
      return {
        customer_name: transaction.meta.CustomerName,
        customer_address: transaction.meta.CustomerAddress,
        unit: transaction.meta.Units,
        product_name: transaction.meta.content.transactions.product_name,
        amount: (transaction.amount / 100).toFixed(2),
        status: transaction.status,
        transaction_date: transaction.meta.transaction_date.date,
        customer_id: transaction.meta.content.transactions.unique_element,
        extra: transaction.meta.Token,
        fee: 100,
      };
    }

    const tokenResponse = await this.providersService.requeryUtilityPurchase({
      reference,
    });
    if (!tokenResponse.success) {
      throw new BadRequestException('Unable to generate bill token!');
    }

    return {
      customer_name: transaction.meta.CustomerName,
      customer_address: transaction.meta.CustomerAddress,
      unit: transaction.meta.Units,
      product_name: transaction.meta.content.transactions.product_name,
      amount: transaction.amount.toFixed(2),
      status: transaction.status,
      transaction_date: transaction.meta.transaction_date.date,
      customer_id: transaction.meta.content.transactions.unique_element,
      extra: transaction.meta.Token,
      fee: 100,
    };
  }
}
