import { Controller, Get, Req, UseGuards, Param, Post, Body } from '@nestjs/common';
import { BillService } from '@src/bill/bill.service';
import { BillResponseDto, PayBillDto } from '@src/bill/dtos/bill.dto';
import { ResidentAuth, AuthenticatedResident } from '@common/decorators/auth.decorator';
import { ResidentUser } from '@common/types';
import { SuccessResponse } from '@common/http';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Resident-Bills')
@Controller({
    path: '/resident/bills',
    version: '1',
})

@ResidentAuth()
export class ResidentBillController {
    constructor(private readonly billService: BillService) { }

    @Get()
    async getResidentBills(@AuthenticatedResident() resident: ResidentUser): Promise<SuccessResponse<BillResponseDto[]>> {
        return await this.billService.getResidentBills(resident.id);
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

