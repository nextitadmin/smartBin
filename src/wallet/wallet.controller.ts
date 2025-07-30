import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  TopUpWalletDto,
  GetWalletResponseDto,
  WalletMockVerifyDto,
} from './dtos/wallet.dto';
import {
  Auth,
  CorporateAuth,
  ResidentAuth,
} from 'src/common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { Public } from '@common/guards/public.guard';

@ApiTags('Wallet')
@Controller({
  path: 'wallets',
  version: '1',
})
@Auth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('mock-verify')
  async mockVerify(@Query() query: WalletMockVerifyDto) {
    const response = await this.walletService.mockWalletCallback(
      query.reference,
    );
    return new SuccessResponse('Wallet callback URL received', null);
  }

  // @Post('topup')
  // async topUp(@Req() req, @Body() dto: TopUpWalletDto) {
  //   const userId = req.user.id;
  //   const response = this.walletService.initiateResidentTopUp(userId, dto);
  //   return new SuccessResponse(' Wallet topped up initiated', response);
  // }
}
