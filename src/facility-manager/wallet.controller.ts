import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    TopUpWalletDto,
    GetWalletResponseDto,
} from '../wallet/dtos/wallet.dto';
import {
    FacilityManagerAuth,
    AuthenticatedFacilityManager,
} from 'src/common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { AuthUser } from '@common/types';

@ApiTags('Facility Manager-Wallet')
@ApiBearerAuth()
@FacilityManagerAuth()
@Controller({
    path: 'facility-managers/wallets',
    version: '1',
})
export class FacilityManagerWalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get()
    @FacilityManagerAuth()
    async getWallet(@AuthenticatedFacilityManager() facility: AuthUser) {
        const response = await this.walletService.getWallet(facility);
        return new SuccessResponse(' Wallet retrieved', response);
    }


    @Post('topup')
    async topUp(
        @AuthenticatedFacilityManager() facility: AuthUser,
        @Body() dto: TopUpWalletDto,
    ) {
        const response = await this.walletService.initiateTopUp(facility, dto);
        return new SuccessResponse('Wallet topped up successfully', response);
    }

    @Post('charge')
    async chargeCorporateWallet(
        @AuthenticatedFacilityManager() facility: AuthUser,
        @Body() dto: TopUpWalletDto,
    ) {
        const response = await this.walletService.chargeWallet({
            user: facility,
            amount: dto.amount,
        });
        return new SuccessResponse('Wallet charged successfully', response);
    }

}
