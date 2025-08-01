import {
  AuthenticatedCorporate,
  CorporateAuth,
} from '@common/decorators/auth.decorator';
import { PaginationQueryDto } from '@common/dto';
import { SuccessResponse } from '@common/http';
import { CorporateUser } from '@common/types';
import { Controller, Get, Injectable, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from '@src/payment/payment.service';
import { TransactionService } from '@src/transaction/transaction.service';

@ApiTags('Corporate/Payment')
@Injectable()
@Controller({
  path: 'corporate/payments',
  version: '1',
})
export class CorporatePaymentController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @CorporateAuth()
  async getPayments(
    @Query() query: PaginationQueryDto,
    @AuthenticatedCorporate() user: CorporateUser,
  ) {
    const payments = await this.transactionService.getTransactions({
      user,
      paging: {
        size: query.limit ? parseInt(query.limit, 10) : 10,
        page: query.page ? parseInt(query.page, 10) : 1,
      },
    });
    return new SuccessResponse('Payments fetched successfully', payments);
  }
}
