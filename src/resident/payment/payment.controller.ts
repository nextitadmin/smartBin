
import {
  AuthenticatedResident,
  ResidentAuth,
} from '@common/decorators/auth.decorator';
import { PaginationQueryDto } from '@common/dto';
import { SuccessResponse } from '@common/http';
import { ResidentUser } from '@common/types';
import { Controller, Get, Injectable, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from '@src/payment/payment.service';
import { TransactionService } from '@src/transaction/transaction.service';

@ApiTags('Resident/Payment')
@Injectable()
@Controller({
  path: 'residents/payment',
  version: '1',
})
export class ResidentPaymentController {
  constructor(private readonly paymentService: TransactionService) { }

  @Get()
  @ResidentAuth()
  async getPayments(
    @Query() query: PaginationQueryDto,
    @AuthenticatedResident() user: ResidentUser,
  ) {
    const payments = await this.paymentService.getTransactions({
      user,
      paging: {
        size: query.limit ? parseInt(query.limit, 10) : 10,
        page: query.page ? parseInt(query.page, 10) : 1,
      },
    });
    return new SuccessResponse('Payments fetched successfully', payments);
  }

  @Get('receipt/:transactionId')
  @ResidentAuth()
  async getReceipt(
    @Param('transactionId') transactionId: string,
    @AuthenticatedResident() user: ResidentUser,
  ) {
    const receipt = await this.paymentService.getReceipt(transactionId, user);
    return new SuccessResponse('Receipt fetched', receipt);
  }
}

