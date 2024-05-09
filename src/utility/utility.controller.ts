import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { SuccessResponse } from '@common/http';
import { PurchaseBillPayload, ValidateBillAttributes } from './types';
import {
  AuthenticatedCustomer,
  CustomerAuth,
} from '@common/decorators/auth.decorator';
import { AuthCustomer } from '@common/types';

@Controller({ path: 'utility', version: '1' })
@CustomerAuth()
export class UtilityController {
  constructor(private readonly utilityService: UtilityService) {}

  @Get()
  async getUtilities() {
    const bills = await this.utilityService.getBills();
    return new SuccessResponse('biills fetched', bills);
  }

  @Post('/validate')
  async validateCustomerUtility(@Body() body: ValidateBillAttributes) {
    const validation = await this.utilityService.validateBill(body);
    return new SuccessResponse('validated successful!', validation);
  }

  @Post('/order')
  @CustomerAuth()
  async orderBill(
    @Body() body: PurchaseBillPayload,
    @AuthenticatedCustomer() customer: AuthCustomer,
  ) {
    const purchaseResponse = await this.utilityService.purchaseBill({
      ...body,
      customer_id: customer.id,
    });
    return new SuccessResponse('bill purchase successful!', purchaseResponse);
  }

  @Get('/order/:reference/token')
  @CustomerAuth()
  async getToken(
    @Param() param: { reference: string },
    @AuthenticatedCustomer() customer: AuthCustomer,
  ) {
    const purchaseResponse = await this.utilityService.generateUtilityToken({
      customer_id: customer.id,
      reference: param.reference,
    });
    return new SuccessResponse('bill generated successful!', purchaseResponse);
  }
}
