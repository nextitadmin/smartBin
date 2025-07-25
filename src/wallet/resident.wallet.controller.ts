import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TopUpWalletDto, GetWalletResponseDto } from './dtos/wallet.dto';
import { ResidentAuth } from 'src/common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';

@ApiTags('Wallet')
@ApiBearerAuth()
@ResidentAuth()
@Controller({
    path: 'resident/wallets',
    version: '1'
})

export class ResidentWalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get()
    async getWallet(@Req() req): Promise<SuccessResponse<GetWalletResponseDto>> {
        const userId = req.user.id;
        return this.walletService.getResidentWallet(userId);
    }

    @Post('topup')
    async topUp(@Req() req, @Body() dto: TopUpWalletDto) {
        const userId = req.user.id;
        const response = this.walletService.initiateResidentTopUp(userId, dto);
        return new SuccessResponse(" Wallet topped up initiated", response)
    }
}
