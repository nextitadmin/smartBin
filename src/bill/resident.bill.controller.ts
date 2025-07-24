import { Controller, Get, Req, UseGuards, Param, Post, Body } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillResponseDto, PayBillDto } from './dtos/bill.dto';
import { ResidentAuth } from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Bills')
@ResidentAuth()
@Controller({
    path: '/resident/bills',
    version: '1',
})
export class ResidentBillController {
    constructor(private readonly billService: BillService) { }

    @Get()
    async getResidentBills(@Req() req): Promise<SuccessResponse<BillResponseDto[]>> {
        const userId = req.user.id;
        return await this.billService.getResidentBills(userId);
    }

    @Post(':billId/pay')
    async payBill(
        @Param('billId') billId: string,
        @Body() dto: PayBillDto,
        @Req() req: any,
    ) {
        const userId = req.user.id;
        const user = req.user;
        return this.billService.payBill(userId, billId, dto, user);
    }
}

