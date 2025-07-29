import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TopUpWalletDto, GetWalletResponseDto } from './dtos/wallet.dto';
import { FacilityManagerAuth } from 'src/common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';

@ApiTags('Wallet')
@ApiBearerAuth()
@FacilityManagerAuth()
@Controller('facility-manager/wallets')
export class FacilityWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@Req() req) {
    const userId = req.user.id;
    const response = await this.walletService.getWallet(userId);
    return new SuccessResponse(' Wallet retrieved', response);
  }

  // @Post('topup')
  // async topUp(@Req() req, @Body() dto: TopUpWalletDto) {
  //     const userId = req.user.id;
  //     const response = this.walletService.initiateTopUp(userId, 'Facility', dto);
  //     return new SuccessResponse(" Wallet topped up successfully", response)
  // }
}
