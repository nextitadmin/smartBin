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
} from '@common/decorators/auth.decorator';
import { CorporateUser, FacilityManagerUser } from '@common/types';
import { SuccessResponse } from '@common/http';

@ApiTags('Corporate-Wallet')
@ApiBearerAuth()
@CorporateAuth()
@Controller({
  path: 'corporate/wallets',
  version: '1',
})
export class CorporateWalletController {
  constructor(private readonly walletService: WalletService) { }



  @Get('wallet')
  @CorporateAuth()
  async getWallet(@AuthenticatedCorporate() corporate: CorporateUser,
  ): Promise<SuccessResponse<GetWalletResponseDto>> {
    const response = await this.walletService.getWallet(corporate.id);
    return new SuccessResponse('Wallet retrieved', response);
  }

  @Post('topup')
  async topUp(@Req() req, @Body() dto: TopUpWalletDto) {
    const userId = req.user.id;
    const response = this.walletService.initiateTopUp(userId, 'Corporate', dto);
    return new SuccessResponse(' Wallet topped up successfully', response);
  }
}
