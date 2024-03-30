import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { Kyc, KycSchema } from '../models/kyc.model';
import { CustomerModule } from '../customer/customer.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    CustomerModule,
    MongooseModule.forFeature([{ name: Kyc.name, schema: KycSchema }]),
  ],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
