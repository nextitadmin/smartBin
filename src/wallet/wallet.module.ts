import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FlutterwaveModule } from '../flutterwave/flutterwave.module';
import { WalletController } from './wallet.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Wallet } from '../models/wallet.model';
import { CustomerModule } from '../customer/customer.module';
import { Customer } from '../models/customer.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Wallet, Customer]),
    FlutterwaveModule,
    CustomerModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
