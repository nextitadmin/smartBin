import { ConsoleLogger, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from '../models/customer.model';
import { Wallet } from '../models/wallet.model';
import { Money } from '../common/utils/money';
import { Model } from 'mongoose';
import { PaystackService } from '@src/providers/paystack.service';
import { TransactionService } from '@src/transaction/transaction.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { events } from '@common/constants';
import { TransactionEvent } from '@src/transaction/dto/transaction.dto';
import { WebhookRequest } from '@models/webhook-request.model';

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(Customer.name) private readonly customer: Model<Customer>,
    @InjectModel(Wallet.name) private readonly wallet: Model<Wallet>,
    @InjectModel(WebhookRequest.name)
    private readonly webhookRequest: Model<WebhookRequest>,
    private readonly paystackService: PaystackService,
    private readonly transactionService: TransactionService,
    private readonly ee: EventEmitter2,
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
  }

  async handlePaystackPaymentNotification(payload: any) {
    if (payload.event === 'charge.success') {
      const { data } = payload;
      await this.transactionService.actionReference({
        referenceId: data.reference,
      });
    }
  }

  async handleBillPaymentsWebhook(payload: any) {
    // log
    this.ee.emit(events.webhook.requestReceived, {
      url: payload.url,
      data: payload.data,
    });

    if (payload.type === 'transaction-update') {
      // Do transaction update
      return this.ee.emit(
        events.transactions.updated,
        new TransactionEvent({
          reference: payload.data.requestId,
          data: payload.data,
        }),
      );
    }

    if (payload.type === 'variations-update') {
      // TODO: should be handled by the utility service
    }
  }

  @OnEvent(events.webhook.requestReceived)
  async handleWebhookRequest(payload: { url: string; data: any }) {
    await this.webhookRequest.create({
      requestedUrl: payload.url,
      data: payload.data,
    });
  }
}
