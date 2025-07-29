// controller
import { Controller, Get, Post, Body, Req, Param } from '@nestjs/common';
import { BillService } from '@src/bill/bill.service';
import { CorporateAuth, AuthenticatedCorporate } from '@common/decorators/auth.decorator';
import { CorporateUser } from '@common/types';
import { SuccessResponse } from '@common/http';
import { CorporateBillResponseDto, PayBillDto } from '@src/bill/dtos/bill.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Corporate-Bills')
@Controller({
    path: 'corporate/bill',
    version: '1',
})

@CorporateAuth()
export class CorporateBillController {
    constructor(private readonly billService: BillService) { }

    @Get()
    async getCorporateBills(
        @AuthenticatedCorporate() corporate: CorporateUser): Promise<SuccessResponse<CorporateBillResponseDto[]>> {
        return this.billService.getCorporateBills(corporate.id);
    }


    @Post(':billId/pay')
    async payCorporateBill(
        @AuthenticatedCorporate() corporate: CorporateUser,
        @Param('billId')
        @Body() dto: PayBillDto,
    ) {
        const userId = corporate.id;
        return this.billService.payCorporateBill(userId, dto, corporate);
    }

}
