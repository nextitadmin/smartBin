import { Controller, Get, Post, Body, } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TopUpWalletDto, GetWalletResponseDto } from './dtos/wallet.dto';
import { ResidentAuth, AuthenticatedResident } from 'src/common/decorators/auth.decorator';
import { AuthUser } from 'src/common/types';
import { Types } from 'mongoose';
import { SuccessResponse } from '@common/http';

@ApiTags('Wallet')
@ApiBearerAuth()
@ResidentAuth()
@Controller('resident/wallets')
export class ResidentWalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get()
    async getWallet(@AuthenticatedResident() resident: AuthUser): Promise<SuccessResponse<GetWalletResponseDto>> {
        const userId = new Types.ObjectId(resident.id);
        const response = await this.walletService.getWallet(userId);
        return new SuccessResponse(" Wallet retrieved", response)

    }

    @Post('topup')
    async topUp(@AuthenticatedResident() resident: AuthUser, @Body() dto: TopUpWalletDto) {
        const userId = new Types.ObjectId(resident.id);
        const response = this.walletService.initiateTopUp(userId, 'Resident', dto);
        return new SuccessResponse(" Wallet topped up successfully", response)
    }
}
