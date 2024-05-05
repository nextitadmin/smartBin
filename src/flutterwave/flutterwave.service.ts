import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAttributes } from '../config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Flutterwave from 'flutterwave-node-v3';
import { CreateVirtualAccountAttributes } from './types/flutterwave.types';
import { generateRandomChars } from '../common/utils';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class FlutterwaveService {
  private flutterwaveInstance: Flutterwave;
  private logger = new Logger(FlutterwaveService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly configService: ConfigService<ConfigAttributes>,
    private readonly eventEmitter: EventEmitter2,
    private readonly http: HttpService,
  ) {
    const flutterwavePubKey = this.configService.get('flutterwave.publicKey', {
      infer: true,
    });
    const flutterwaveSecretKey = this.configService.get(
      'flutterwave.secretKey',
      {
        infer: true,
      },
    );
    this.flutterwaveInstance = new Flutterwave(
      flutterwavePubKey,
      flutterwaveSecretKey,
    ) as any;
  }

  async createVirtualAccount(payload: CreateVirtualAccountAttributes) {
    const virtualAccountResponse =
      await this.flutterwaveInstance.VirtualAcct.create({
        ...payload,
        tx_ref: `LVA-${generateRandomChars(16)}`,
      });
    if (virtualAccountResponse.status !== 'success') {
      this.logger.error(virtualAccountResponse);
      throw new BadRequestException('Unable to create virtual wallet account');
    }

    return virtualAccountResponse.data;
  }

  async getVirtualAccount(payload: Pick<CreateVirtualAccountAttributes, 'id'>) {
    const virtualAccount = await this.flutterwaveInstance.VirtualAcct.fetch(
      payload,
    );
    if (virtualAccount.status !== 'success') {
      throw new BadRequestException('Unable to get virtual wallet account');
    }

    return virtualAccount.data;
  }

  async getBillCategories() {
    try {
      let bills: Record<string, any>[];
      bills = JSON.parse(await this.cacheService.get('BILL_CATEGORIES'));
      if (bills) return this.mapBillerCategories(bills);

      const billCategories =
        await this.flutterwaveInstance.Bills.fetch_bills_Cat();

      bills = billCategories.data.filter(
        (d: { country: string; name: string }) =>
          d.country === 'NG' && d.name.toLowerCase().includes('prepaid'),
      );

      await this.cacheService.set('BILL_CATEGORIES', JSON.stringify(bills), 0);

      return this.mapBillerCategories(bills);
    } catch (error) {
      this.logger.error(error.response.data);
      throw new BadRequestException('Unable to fetch bills at the moment!');
    }
  }

  mapBillerCategories(cats: Record<string, any>[]) {
    return cats.map(
      (cat: { biller_code: string; name: string; item_code: string }) => ({
        code: cat.biller_code,
        name: cat.name,
        itemCode: cat.item_code,
      }),
    );
  }

  async getBillersByCategory(biller: string) {}

  async getBillsByBillersCode(billerCode: string) {}

  async validateCustomerBillDetails({
    billerCode,
    customer,
    itemCode,
  }: {
    billerCode: string;
    customer: string;
    itemCode: string;
  }) {
    try {
      console.log({ itemCode, billerCode, customer });
      const response = await this.flutterwaveInstance.Bills.validate({
        item_code: itemCode,
        code: billerCode,
        customer,
      });

      console.log(response);

      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Invalid customer details!');
    }
  }

  async initiateBillPayment({}: {
    billerCode: string;
    itemCode: string;
    customer: string;
    amount: string;
  }) {}

  // async getBillPaymentshistory() {} TBD.
  // async getVirtualAccounts() {
  //   return await this.flutterwaveInstance.VirtualAcct.
  // }
}
