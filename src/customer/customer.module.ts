import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer, CustomerSchema } from '../models/customer.model';
import { CustomerController } from './customer.controller';
import { PaymentService } from '../payment/payment.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, PaymentService],
  exports: [CustomerService],
})
export class CustomerModule {}
