import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TopUpWalletDto, GetWalletResponseDto } from './dtos/wallet.dto';
import { AgentAuth } from 'src/common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';

@ApiTags('Wallet')
@ApiBearerAuth()
@AgentAuth()
@Controller({
    path: 'agent/wallets',
    version: '1'
})
export class AgentWalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get()
    async getWallet(@Req() req): Promise<SuccessResponse<GetWalletResponseDto>> {
        const userId = req.user.id;
        const response = await this.walletService.getWallet(userId);
        return new SuccessResponse(" Wallet retrieved", response)

    }

    @Post('topup')
    async topUp(@Req() req, @Body() dto: TopUpWalletDto) {
        const userId = req.user.id;
        const response = this.walletService.initiateTopUp(userId, 'Agent', dto);
        return new SuccessResponse(" Wallet topped up successfully", response)
    }
}
