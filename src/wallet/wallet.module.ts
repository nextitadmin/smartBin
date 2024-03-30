import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FlutterwaveModule } from '../flutterwave/flutterwave.module';
import { WalletController } from './wallet.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Wallet, WalletSchema } from '../models/wallet.model';
import { CustomerModule } from '../customer/customer.module';
import { Customer, CustomerSchema } from '../models/customer.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
    FlutterwaveModule,
    CustomerModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
