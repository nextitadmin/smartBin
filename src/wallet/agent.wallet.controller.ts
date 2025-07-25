import { Controller, Get, Post, Body, } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TopUpWalletDto, GetWalletResponseDto } from './dtos/wallet.dto';
import { AgentAuth, AuthenticatedAgent } from 'src/common/decorators/auth.decorator';
import { AuthUser } from 'src/common/types';
import { Types } from 'mongoose';
import { SuccessResponse } from '@common/http';

@ApiTags('Wallet')
@ApiBearerAuth()
@AgentAuth()
@Controller('agent/wallets')
export class AgentWalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get()
    async getWallet(@AuthenticatedAgent() agent: AuthUser): Promise<SuccessResponse<GetWalletResponseDto>> {
        const userId = new Types.ObjectId(agent.id);
        const response = await this.walletService.getWallet(userId);
        return new SuccessResponse(" Wallet retrieved", response)

    }

    @Post('topup')
    async topUp(@AuthenticatedAgent() agent: AuthUser, @Body() dto: TopUpWalletDto) {
        const userId = new Types.ObjectId(agent.id);
        const response = this.walletService.initiateTopUp(userId, 'Agent', dto);
        return new SuccessResponse(" Wallet topped up successfully", response)
    }
}
