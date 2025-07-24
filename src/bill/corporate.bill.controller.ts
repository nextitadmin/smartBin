// controller
import { Controller, Get, Post, Body, Req, Param } from '@nestjs/common';
import { BillService } from './bill.service';
import { PayBillDto } from './dtos/bill.dto';
import { CorporateAuth } from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { CorporateBillResponseDto } from './dtos/bill.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth()
@ApiTags('Bills')
@CorporateAuth()
@Controller({
    path: 'corporate/bill',
    version: '1',
})
export class CorporateBillController {
    constructor(private readonly billService: BillService) { }

    @Get()
    async getFacilityBills(@Req() req): Promise<SuccessResponse<CorporateBillResponseDto[]>> {
        const userId = req.user.id;
        return this.billService.getCorporateBills(userId);
    }

    @Post(':billId/pay')
    async payCorporateBill(@Req() req, @Param('billId') @Body() dto: PayBillDto) {
        const userId = req.user.id;
        const user = req.user;
        return this.billService.payCorporateBill(userId, dto, user);
    }
}
