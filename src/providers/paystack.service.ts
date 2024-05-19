import { generateRandomChars } from '@common/utils';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAttributes } from '@src/config';

@Injectable()
export class PaystackService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ConfigAttributes>,
  ) {}

  async verifyTransaction(reference: string) {
    const paystackConfig = this.configService.get('paystack', {
      infer: true,
    });

    const validationResponse = await this.httpService.axiosRef.get(
      `${paystackConfig.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
        },
      },
    );

    if (
      !validationResponse.data.status ||
      validationResponse.data.data.status !== 'success'
    ) {
      throw new BadRequestException('Invalid or pending transaction');
    }

    return validationResponse.data.data;
  }
}
