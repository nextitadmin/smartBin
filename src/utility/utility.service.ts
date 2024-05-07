import { BadRequestException, Injectable } from '@nestjs/common';
import { FlutterwaveService } from '@src/flutterwave/flutterwave.service';
import { PurchaseBillPayload, ValidateBillAttributes } from './types';
import { generateRandomChars } from '@common/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from '@models/customer.model';
import { Model } from 'mongoose';
import { Wallet } from '@models/wallet.model';
import { ProviderService } from '@src/provider/provider.service';

@Injectable()
export class UtilityService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    private readonly providerService: ProviderService,
    private readonly flutterwaveService: FlutterwaveService, //
  ) {}

  async getBills() {
    return await this.flutterwaveService.getBillCategories();
  }

  async validateBill(payload: ValidateBillAttributes) {
    const response = await this.providerService.validateUtility({
      serviceId: 'ibadan-electric',
      // billerCode: payload.billCode,
      // itemCode: payload.itemCode,
      customerId: payload.customerIdentifier,
    });

    return {
      name: response.Customer_Name,
      accountType: response.Customer_Account_Type,
    };
  }

  async purchaseBill(payload: PurchaseBillPayload) {
    console.log({ payload });
    const purchaseReference = generateRandomChars(18).toUpperCase();

    const customer = await this.customerModel
      .findById(payload.customer_id)
      .select('email first_name phone');

    const customerWallet = await this.walletModel.findOne({
      customer_id: payload.customer_id,
    });

    console.log(customerWallet);
    if (!customerWallet || customerWallet.available_balance < payload.amount) {
      throw new BadRequestException('Insufficient funds to complete purchase!');
    }

    // Debit customer wallet
    await this.walletModel.findByIdAndUpdate(customerWallet._id, {
      available_balance: customerWallet.available_balance - payload.amount,
      ledger_balance: customerWallet.ledger_balance - payload.amount,
    });

    console.log(customer);

    const response = await this.providerService.purchaseUtility({
      customerId: payload.customerIdentifier,
      amount: payload.amount,
      phone: customer.phone,
      serviceId: 'ibadan-electric',
    });

    console.log('response', response);

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
}
