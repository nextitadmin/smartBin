import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  TopUpWalletDto,
  GetWalletResponseDto,
} from '../wallet/dtos/wallet.dto';
import {
  AgentAuth,
  AuthenticatedAgent,
} from 'src/common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { AuthUser } from '@common/types';

@ApiTags('Agent-Wallet')
@ApiBearerAuth()
@AgentAuth()
@Controller({
  path: 'agents/wallets',
  version: '1',
})
export class AgentWalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get()
  @AgentAuth()
  async getWallet(@AuthenticatedAgent() agent: AuthUser) {
    const response = await this.walletService.getWallet(agent);
    return new SuccessResponse(' Wallet retrieved', response);
  }

  // @Post('topup')
  // async topUp(@Req() req, @Body() dto: TopUpWalletDto) {
  //   const userId = req.user.id;
  //   const response = this.walletService.initiateTopUp(userId, 'Agent', dto);
  //   return new SuccessResponse(' Wallet topped up successfully', response);
  // }
}
