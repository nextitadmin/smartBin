import { generateRandomChars } from '@common/utils';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAttributes } from '@src/config';

@Injectable()
export class PaystackService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ConfigAttributes>,
  ) {}

  async validateUtility({
    customerId,
    serviceId,
    type = 'prepaid',
  }: {
    customerId: string;
    serviceId: string;
    type?: 'prepaid';
  }) {
    const vtpassConfig = this.configService.get('vtpass', {
      infer: true,
    });
    const vtpassApiKey = this.configService.get('vtpass.baseUrl', {
      infer: true,
    });

    console.log({ vtpassConfig, vtpassApiKey });
    const validationResponse = await this.httpService.axiosRef.post(
      `${vtpassConfig.baseUrl}/api/merchant-verify`,
      {
        billersCode: Number(customerId),
        serviceID: serviceId,
        type,
      },
      {
        headers: {
          'api-key': vtpassConfig.apiKey,
          'secret-key': vtpassConfig.secretKey,
        },
      },
    );

    console.log(validationResponse.data);

    if (validationResponse.data.code !== '000') {
      throw new Error(validationResponse.data.message);
    }

    return validationResponse.data.content;
  }

  async purchaseUtility({
    customerId,
    serviceId,
    amount,
    phone,
    type = 'prepaid',
  }: {
    customerId: string;
    serviceId: string;
    type?: 'prepaid';
    amount: number;
    phone: string;
  }) {
    const vtpassConfig = this.configService.get('vtpass', {
      infer: true,
    });
    const da = new Date();
    let reference = `${da.getFullYear().toLocaleString()}${generateRandomChars(
      12,
    )}`;
    const [date, time] = reference.split('T');
    reference = `${date}${time}`;
    // return console.log(reference);
    const validationResponse = await this.httpService.axiosRef.post(
      `${vtpassConfig.baseUrl}/api/pay`,
      {
        request_id: reference,
        serviceID: 'ibadan-electric',
        billersCode: customerId,
        variation_code: type,
        amount,
        phone,
      },
      {
        headers: {
          'api-key': vtpassConfig.apiKey,
          'secret-key': vtpassConfig.secretKey,
        },
      },
    );

    console.log(validationResponse);

    // if (validationResponse.data.code !== '000') {
    //   throw new Error(validationResponse);
    // }

    return validationResponse.data.content;
  }
}
