import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  TopUpWalletDto,
  GetWalletResponseDto,
} from '../wallet/dtos/wallet.dto';
import {
  AuthenticatedCorporate,
  CorporateAuth,
} from 'src/common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { CorporateUser } from '@common/types';

@ApiTags('Corporate-Wallet')
@CorporateAuth()
@Controller({
  path: 'corporate/wallets',
  version: '1',
})
export class CorporateWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@AuthenticatedCorporate() corporate: CorporateUser) {
    const response = await this.walletService.getWallet(corporate.id);
    return new SuccessResponse(' Wallet retrieved', response);
  }

  @Post('topup')
  async topUp(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() dto: TopUpWalletDto,
  ) {
    const response = await this.walletService.initiateTopUp(
      corporate.id,
      'Corporate',
      dto,
    );
    return new SuccessResponse(' Wallet topped up successfully', response);
  }
}
