import { Controller, Get } from '@nestjs/common';
import {
  AuthenticatedCustomer,
  CustomerAuth,
} from '../common/decorators/auth.decorator';
import { AuthCustomer } from '../common/types';
import { WalletService } from './wallet.service';
import { SuccessResponse } from '../common/http';

@Controller({ path: 'wallets', version: '1' })
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @CustomerAuth()
  async getCustomerWallets(@AuthenticatedCustomer() customer: AuthCustomer) {
    const wallets = await this.walletService.getCustomerWallets(customer.id);
    return new SuccessResponse('wallets fetched', wallets);
  }

  @Get('/admin/wallets')
  async getCustomersWallets() {
    const wallets = await this.walletService.getCustomersWallets();
    return new SuccessResponse('wallets fetched', wallets);
  }
}
