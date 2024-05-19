import { Injectable } from '@nestjs/common';
import { VTPassService } from './vtpass.service';

@Injectable()
export class ProvidersService {
  constructor(private readonly vtpassService: VTPassService) {}

  async validateUtility({
    customerId,
    serviceId,
    type = 'prepaid',
  }: {
    customerId: string;
    serviceId: string;
    type?: 'prepaid';
  }) {
    const billValidationResponse = await this.vtpassService.validateUtility({
      customerId,
      serviceId,
      type,
    });

    return billValidationResponse;
  }

  async purchaseUtility({
    customerId,
    reference,
    serviceId,
    amount,
    phone,
    type = 'prepaid',
  }: {
    customerId: string;
    reference: string;
    serviceId?: string;
    type?: 'prepaid';
    amount: number;
    phone: string;
  }) {
    const purchaseResponse = await this.vtpassService.purchaseUtility({
      customerId,
      reference,
      serviceId,
      amount,
      phone,
      type,
    });
    if (!purchaseResponse.success) {
      return {
        success: false,
        error: purchaseResponse.error,
      };
    }

    return {
      success: true,
      data: {
        reference: purchaseResponse.data.requestId,
        meta: purchaseResponse.data,
      },
    };
  }

  async requeryUtilityPurchase({ reference }: { reference: string }) {
    const purchaseResponse =
      await this.vtpassService.queryUtilityTransactionStatus({
        reference,
      });
    if (!purchaseResponse.success) {
      return {
        success: false,
        error: purchaseResponse.error,
      };
    }

    return {
      success: true,
      data: {
        reference: purchaseResponse.data.requestId,
        meta: purchaseResponse.data,
      },
    };
  }
}
