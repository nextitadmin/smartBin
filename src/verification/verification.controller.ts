import { Controller, Get, Query } from '@nestjs/common';
import { VerificationService } from './verification.service';
import {
  AuthenticatedCustomer,
  CustomerAuth,
} from '@common/decorators/auth.decorator';
import { BeneficiaryProductType } from '@models/beneficiary.model';
import { AuthCustomer } from '@common/types';
import { SuccessResponse } from '@common/http';

@Controller({ path: 'verifications', version: '1' })
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('beneficiaries')
  @CustomerAuth()
  async getBeneficiaries(
    @Query() query: { type: BeneficiaryProductType },
    @AuthenticatedCustomer() customer: AuthCustomer,
  ) {
    const data = await this.verificationService.getBeneficiaries({
      customerId: customer.id,
      productType: query.type,
    });
    return new SuccessResponse('beneficiary fetched', data);
  }
}
