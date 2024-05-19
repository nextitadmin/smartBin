import { generateRandomChars } from '@common/utils';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAttributes } from '@src/config';
import { PaystackService } from './paystack.service';
import { REMOVE_EXTRA_CHARS_REGEX } from '@common/constants';
import { format } from 'date-fns';

@Injectable()
export class VTPassService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ConfigAttributes>,
  ) {}

  private logger = new Logger(VTPassService.name);
  async validateUtility({
    customerId,
    serviceId,
    type = 'prepaid',
  }: {
    customerId: string;
    serviceId: string;
    type?: 'prepaid';
  }) {
    try {
      const vtpassConfig = this.configService.get('vtpass', {
        infer: true,
      });

      console.log({ customerId, serviceId, type });
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

      console.log(validationResponse);

      if (validationResponse.data.content.error) {
        throw new BadRequestException(validationResponse.data.content.error);
      }

      return validationResponse.data.content;
    } catch (error) {
      this.logger.error(error.response);
      throw new BadRequestException(error);
    }
  }

  async purchaseUtility({
    customerId,
    reference,
    amount,
    phone,
    type = 'prepaid',
  }: {
    customerId: string;
    reference: string;
    phone: string;
    amount: number;
    type?: 'prepaid';
    serviceId?: string;
  }) {
    try {
      const vtpassConfig = this.configService.get('vtpass', {
        infer: true,
      });
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

      return {
        success: true,
        data: validationResponse.data,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        error: 'Failed to complete bill payment',
      };
    }
  }

  async queryUtilityTransactionStatus({ reference }: { reference: string }) {
    try {
      const vtpassConfig = this.configService.get('vtpass', {
        infer: true,
      });
      const validationResponse = await this.httpService.axiosRef.post(
        `${vtpassConfig.baseUrl}/api/requery`,
        {
          request_id: reference,
        },
        {
          headers: {
            'api-key': vtpassConfig.apiKey,
            'secret-key': vtpassConfig.secretKey,
          },
        },
      );

      return {
        success: true,
        data: validationResponse.data,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        error: 'Failed to complete bill payment',
      };
    }
  }
}
