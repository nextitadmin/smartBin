import { Injectable } from '@nestjs/common';
import { FlutterwaveService } from '@src/flutterwave/flutterwave.service';
import { PurchaseBillPayload, ValidateBillAttributes } from './types';
import { generateRandomChars } from '@common/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from '@models/customer.model';
import { Model } from 'mongoose';

@Injectable()
export class UtilityService {
  constructor(
    private readonly flService: FlutterwaveService,

    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
  ) {}

  async getBills() {
    return await this.flService.getBillCategories();
  }

  async validateBill(payload: ValidateBillAttributes) {
    return await this.flService.validateCustomerBillDetails({
      billerCode: payload.billCode,
      itemCode: payload.itemCode,
      customer: payload.customerIdentifier,
    });
  }

  async purchaseBill(payload: PurchaseBillPayload) {
    const purchaseReference = generateRandomChars(18).toUpperCase();

    const customer = await this.customerModel
      .findById(payload.customer_id)
      .select('email');

    console.log({ ...payload, purchaseReference, customer });
  }
}
