import { AuthenticatedAgent,AgentAuth 
} from "@common/decorators/auth.decorator";
import { PaginationQueryDto } from "@common/dto";
import { AgentUser } from "@common/types";
import { TransactionService } from "@src/transaction/transaction.service";
import { Injectable } from "@nestjs/common";
import { Controller, Get, Query} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SuccessResponse } from "@common/http";



@ApiTags('Agents/Payment')
@Injectable()
@Controller({
    path: 'agents/payment',
    version: '1'
})
export class AgentPaymentController {
  constructor(private readonly paymentService: TransactionService) {}

  @Get()
  @AgentAuth()
  async getPayments(
    @Query() query: PaginationQueryDto,
    @AuthenticatedAgent() user: AgentUser,
  ) {
    const payments = await this.paymentService.getTransactions({
        user,
        paging: {
            size: query.limit ? parseInt(query.limit, 10) : 10,
            page: query.page ? parseInt(query.page, 10) : 1,
        },
    });
    
    return new SuccessResponse('payment successful',payments);
  }
}
