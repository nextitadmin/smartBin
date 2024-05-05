import { Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { FlutterwaveModule } from '@src/flutterwave/flutterwave.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from '@models/customer.model';
import { CustomerModule } from '@src/customer/customer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Customer.name,
        schema: CustomerSchema,
      },
    ]),
    CustomerModule,
    FlutterwaveModule,
  ],
  controllers: [UtilityController],
  providers: [UtilityService],
})
export class UtilityModule {}
