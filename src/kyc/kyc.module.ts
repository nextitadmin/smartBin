import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Kyc } from '../models/kyc.model';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [CustomerModule, SequelizeModule.forFeature([Kyc])],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
