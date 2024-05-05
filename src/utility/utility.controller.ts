import { Body, Controller, Get, Post } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { SuccessResponse } from '@common/http';
import { PurchaseBillPayload, ValidateBillAttributes } from './types';
import { CustomerAuth } from '@common/decorators/auth.decorator';

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
  async orderBill(@Body() body: PurchaseBillPayload) {
    const purchaseResponse = await this.utilityService.purchaseBill(body);
    return new SuccessResponse('bill purchase successful!', purchaseResponse);
  }
}
