// controller
import { Controller, Get, Post, Body, Req, Param } from '@nestjs/common';
import { BillService } from './bill.service';
import { PayBillDto } from './dtos/bill.dto';
import { FacilityManagerAuth } from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { FacilityBillResponseDto } from './dtos/bill.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Bills')
@FacilityManagerAuth()
@Controller({
    path: 'facility/bills',
    version: '1',
})
export class FacilityBillController {
    constructor(private readonly billService: BillService) { }

    @Get()

    async getFacilityBills(@Req() req): Promise<SuccessResponse<FacilityBillResponseDto[]>> {
        const userId = req.user.id;
        return this.billService.getFacilityBills(userId);
    }

    @Post(':billId/pay')
    async payFacilityBill(@Req() req, @Param('billId') @Body() dto: PayBillDto) {
        const userId = req.user.id;
        const user = req.user;
        return this.billService.payFacilityBill(userId, dto, user);
    }
}
