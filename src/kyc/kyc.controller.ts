import { Body, Controller, Param, Post } from '@nestjs/common';
import { KycService } from './kyc.service';
import { SuccessResponse } from '../common/http';
import {
  AuthenticatedCustomer,
  CustomerAuth,
} from '../common/decorators/auth.decorator';
import { AuthCustomer } from '../common/types';
import { KycType } from './types/kyc.types';

@Controller({
  path: 'kycs',
  version: '1',
})
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('/:type')
  @CustomerAuth()
  async enrollKyc(
    @Param() param: { type: KycType },
    @Body() body: { bvn?: string; nin?: string },
    @AuthenticatedCustomer() customer: AuthCustomer,
  ) {
    await this.kycService.enrollBvn({
      customer_id: customer.id,
      bvn: body.bvn,
    });

    return new SuccessResponse('KYC Enrolled Successful', null);
  }

  @CustomerAuth()
  async getCustomerKyc(@AuthenticatedCustomer() customer: AuthCustomer) {
    const kyc = await this.kycService.getKycByCustomer(customer.id);
    return new SuccessResponse('kyc fetched', kyc);
  }
}
