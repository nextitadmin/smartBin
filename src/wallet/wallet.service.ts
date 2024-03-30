import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { events } from '../common/constants';
import { FlutterwaveService } from '../flutterwave/flutterwave.service';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from '../models/wallet.model';
import { KycUpgradedEvent } from '../kyc/kyc.event';
import { KycTier } from '../models/kyc.model';
import { Customer } from '../models/customer.model';
import { Model } from 'mongoose';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private readonly wallet: Model<Wallet>,
    @InjectModel(Customer.name) private readonly customer: Model<Customer>,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly ee: EventEmitter2,
  ) {}
  private logger = new Logger(WalletService.name);

  async getCustomerWallets(customer_id: string) {
    return this.wallet
      .find({
        customer_id,
      })
      .select('_id account_number bank_name');
  }

  async getCustomersWallets() {
    // const wallets = await this.flutterwaveService.getVirtualAccounts();
    return this.wallet.find({}).sort({ createdAt: -1 });
  }

  @OnEvent(events.kyc.upgraded)
  async handleKycUpgraded(event: KycUpgradedEvent) {
    try {
      const { data } = event;
      if (data.tier !== KycTier.Two) {
        return this.logger.log('Only create wallets on tier 2!');
      }

      const customerDetails = await this.customer.findById(data.customer_id);
      const accountDetails = await this.flutterwaveService.createVirtualAccount(
        {
          email: customerDetails.email,
          bvn: data.bvn,
          is_permanent: true,
        },
      );

      console.log({ accountDetails });

      if (!accountDetails) {
        return this.logger.warn(
          'Unable to create user virtual account, Please retry!',
        );
      }

      const customerWallet = await this.wallet.create({
        customer_id: data.customer_id,
        bank_name: accountDetails.bank_name,
        wallet_id: accountDetails.tx_ref,
        external_wallet_id: accountDetails.order_ref,
        account_number: accountDetails.account_number,
        available_balance: 0,
        ledger_balance: 0,
        note: accountDetails.note,
      });
      await customerWallet.save();

      this.logger.log('completed wallet creation on tier2');
    } catch (error) {
      this.logger.error(error);
    }
  }
}
