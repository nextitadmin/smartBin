import {
  AuthenticatedFacilityManager, FacilityManagerAuth
} from "@common/decorators/auth.decorator";
import { PaginationQueryDto } from "@common/dto";
import { FacilityManagerUser } from "@common/types";
import { TransactionService } from "@src/transaction/transaction.service";
import { Injectable, Param } from "@nestjs/common";
import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SuccessResponse } from "@common/http";



@ApiTags('Facility-manager/Payment')
@Injectable()
@Controller({
  path: 'facility-manager/payment',
  version: '1'
})
export class FacilityManagerPaymentController {
  constructor(private readonly paymentService: TransactionService) { }

  @Get()
  @FacilityManagerAuth()
  async getPayments(
    @Query() query: PaginationQueryDto,
    @AuthenticatedFacilityManager() user: FacilityManagerUser,
  ) {
    const payments = await this.paymentService.getTransactions({
      user,
      paging: {
        size: query.limit ? parseInt(query.limit, 10) : 10,
        page: query.page ? parseInt(query.page, 10) : 1,
      },
    });

    return new SuccessResponse('payment successful', payments);
  }

  @Get('receipt/:transactionId')
  @FacilityManagerAuth()
  async getReceipt(
    @Param('transactionId') transactionId: string,
    @AuthenticatedFacilityManager() user: FacilityManagerUser,
  ) {
    const receipt = await this.paymentService.getReceipt(transactionId, user);
    return new SuccessResponse('Receipt fetched', receipt);
  }
}
