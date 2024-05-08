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

@Injectable()
export class UtilityService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    private readonly providerService: ProviderService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly transactionService: TransactionService,
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
    // console.log({ payload });

    const customer = await this.customerModel
      .findById(payload.customer_id)
      .select('email first_name phone');

    const customerWallet = await this.walletModel.findOne({
      customer_id: payload.customer_id,
    });

    if (!customerWallet || customerWallet.available_balance < payload.amount) {
      throw new BadRequestException('Insufficient funds to complete purchase!');
    }

    console.log('customerWallet', customerWallet);

    const debitAmount = payload.amount;

    // Debit customer wallet
    await this.walletModel.findByIdAndUpdate(customerWallet._id, {
      available_balance: customerWallet.available_balance - debitAmount,
      ledger_balance: customerWallet.ledger_balance - debitAmount,
    });

    const transactionAmount = payload.amount - 15000; // 15000 is transaction fee and in kobo

    const reference = await this.transactionService.createTransaction({
      customer_id: payload.customer_id,
      amount: transactionAmount,
      type: TransactionType.BillPayment,
      narration: 'Bill Payment',
    });

    // const response = await this.providerService.purchaseUtility({
    //   customerId: payload.customerIdentifier,
    //   amount: payload.amount,
    //   phone: customer.phone,
    //   serviceId: 'ibadan-electric',
    // });
    const billPayload = {
      customer: payload.customerIdentifier,
      amount: transactionAmount / 100,
      // phone: customer.phone,
      // serviceId: 'ibadan-electric',
      itemCode: payload.itemCode,
      billerCode: payload.billCode,
      reference,
    };
    // console.log(billPayload);
    // return reference;
    const billResponse = await this.flutterwaveService.initiateBillPayment(
      billPayload,
    );

    await this.transactionService.actionReference({
      customer_id: payload.customer_id,
      referenceId: reference,
      meta: billResponse,
    });

    return reference;

    // console.log('response', response);

    // Proceed to flutterwave payment
    // const response = await this.flutterwaveService.initiateBillPayment({
    //   billerCode: payload.billCode,
    //   itemCode: payload.itemCode,
    //   customer: {
    //     name: customer.first_name,
    //     email: customer.email,
    //     phone_number: customer.phone,
    //   },
    //   amount: payload.amount,
    //   reference: purchaseReference,
    // });

    // console.log(response);

    // console.log({ ...payload, purchaseReference, customer });
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
    if (tokenResponse.extra === null) {
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
      throw new BadRequestException('Transaction not found!');
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
          finalResponse: tokenResponse,
        },
      },
    );

    return tokenResponse;
  }
}
