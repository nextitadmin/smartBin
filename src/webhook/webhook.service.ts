import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from '../models/customer.model';
import { Wallet } from '../models/wallet.model';
import { Money } from '../common/utils/money';
import { Model } from 'mongoose';

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(Customer.name) private readonly customer: Model<Customer>,
    @InjectModel(Wallet.name) private readonly wallet: Model<Wallet>,
  ) {}

  private logger = new Logger(WebhookService.name);

  async handleFlutterwaveWebhook(data: any) {
    if (data['event.type'] === 'BANK_TRANSFER_TRANSACTION') {
      const { data: transferData } = data;
      const customerDetails = await this.customer.findOne({
        where: {
          email: transferData.customer.email,
        },
      });

      if (!customerDetails) {
        return this.logger.log('Money no match us o');
      }

      // Get amount transffered and credit wallet!
      const { amount } = transferData;
      const customerWallet = await this.wallet.findOne({
        where: {
          customer_id: customerDetails.id,
        },
      });
      customerWallet.available_balance += amount;
      customerWallet.ledger_balance += amount;
      await customerWallet.save();

      // create transaction record

      // send push notification
    }
    console.log({ data });
  }
}
