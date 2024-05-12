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

  async initiateBillPayment({
    billerCode,
    itemCode,
    customer,
    amount,
    reference,
  }: {
    billerCode: string;
    itemCode: string;
    customer: string;
    amount: number;
    reference: string;
  }) {
    try {
      // return {
      //   success: true,
      //   data: {
      //     phone_number: '0159006370955',
      //     amount: 1000,
      //     network: null,
      //     code: '300',
      //     tx_ref: 'CF-FLYAPI-20240507111107130841654',
      //     reference: 'LMOhMT8HZMMQF08L3vK',
      //     batch_reference: null,
      //     recharge_token: '1445-2112-4994-5230-5397',
      //     fee: 100,
      //   },
      // };

      const flutterwaveSecretKey = this.configService.get(
        'flutterwave.secretKey',
        {
          infer: true,
        },
      );
      console.log({ reference });
      const response = await this.http.axiosRef.post(
        `https://api.flutterwave.com/v3/billers/${billerCode}/items/${itemCode}/payment`,
        {
          country: 'NG',
          customer_id: customer,
          amount,
          // customer_id: '0159006370955',
          // amount: 100,
          reference,
        },
        {
          headers: {
            Authorization: `Bearer ${flutterwaveSecretKey}`,
          },
        },
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      this.logger.error(error.response);
      return {
        success: false,
        message: 'Failed to Complete bill payment',
      };
    }
  }

  async getBillPaymentStatus({ reference }) {
    try {
      // reference = 'LMOmYzmkNX2OOl0nUc5';
      const flutterwaveSecretKey = this.configService.get(
        'flutterwave.secretKey',
        {
          infer: true,
        },
      );
      const response = await this.http.axiosRef.get(
        `https://api.flutterwave.com/v3/bills/${reference}`,

        {
          headers: {
            Authorization: `Bearer ${flutterwaveSecretKey}`,
          },
        },
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        message: 'Failed to Complete bill payment',
      };
    }
  }
}
