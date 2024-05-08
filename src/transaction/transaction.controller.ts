import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  AuthenticatedCustomer,
  CustomerAuth,
} from '@common/decorators/auth.decorator';
import { AuthCustomer } from '@common/types';
import { TransactionType } from '@models/transaction.model';
import { SuccessResponse } from '@common/http';

@Controller({
  path: 'transactions',
  version: '1',
})
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/reference')
  @CustomerAuth()
  async generateTransactionReference(
    @AuthenticatedCustomer() customer: AuthCustomer,
    @Query() query: { transactionType: TransactionType; amount?: string },
  ) {
    const response = await this.transactionService.generateReference({
      customer_id: customer.id,
      type: query.transactionType,
      amount: query.amount ? Number(query.amount) : 10,
    });

    return new SuccessResponse('Transaction reference generated', response);
  }

  @Post('/reference/:referenceId')
  @CustomerAuth()
  async actionTransactionReference(
    @AuthenticatedCustomer() customer: AuthCustomer,
    @Param() param: { referenceId: string },
    @Body() body: { amount: string | number },
  ) {
    const actionTransaction = await this.transactionService.actionReference({
      customer_id: customer.id,
      referenceId: param.referenceId,
      amount: Number(body.amount),
    });

    return new SuccessResponse('Action on transaction', actionTransaction);
  }
}
