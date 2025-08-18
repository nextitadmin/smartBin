import { Controller, Get, Post, Body, Req, Param } from '@nestjs/common';
import { BillService } from '@src/bill/bill.service';
import {
    FacilityManagerAuth,
    AuthenticatedFacilityManager,
} from '@common/decorators/auth.decorator';
import { FacilityManagerUser } from '@common/types';
import { SuccessResponse } from '@common/http';
import { CorporateBillResponseDto, PayBillDto } from '@src/bill/dtos/bill.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Facility Manager - Bills')
@Controller({
    path: 'facility-manager/bill',
    version: '1',
})
@FacilityManagerAuth()
export class FacilityManagerBillController {
    constructor(private readonly billService: BillService) { }

    @Get()
    async getBills(
        @AuthenticatedFacilityManager() manager: FacilityManagerUser,
    ): Promise<SuccessResponse<CorporateBillResponseDto[]>> {
        return this.billService.getCorporateBills(manager.id);
    }

    @Post(':billId/pay')
    async payFacilityManagerBill(
        @AuthenticatedFacilityManager() manager: FacilityManagerUser,
        @Param('billId')
        @Body()
        dto: PayBillDto,
    ) {
        const userId = manager.id;
        return this.billService.payCorporateBill(userId, dto, manager);
    }
}
