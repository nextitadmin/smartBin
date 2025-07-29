import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  TopUpWalletDto,
  GetWalletResponseDto,
} from '../wallet/dtos/wallet.dto';
import {
  Auth,
  AuthenticatedCorporate,
  CorporateAuth,
} from '@common/decorators/auth.decorator';
import { CorporateUser, FacilityManagerUser } from '@common/types';
import { SuccessResponse } from '@common/http';

@ApiTags('Corporate-Wallet')
@Controller({
  path: 'corporate/wallets',
  version: '1',
})
@CorporateAuth()
export class CorporateWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@AuthenticatedCorporate() corporate: CorporateUser) {
    const response = await this.walletService.getWallet(corporate);
    return new SuccessResponse('Wallet retrieved', response);
  }

  @Post('topup')
  async topUp(
    @AuthenticatedCorporate() corporate: CorporateUser,
    @Body() dto: TopUpWalletDto,
  ) {
    const response = await this.walletService.initiateTopUp(corporate, dto);
    return new SuccessResponse('Wallet topped up successfully', response);
  }
  //   }
}
