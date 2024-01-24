import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer } from '../models/customer.model';
import { CustomerController } from './customer.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaymentService } from '../payment/payment.service';

@Module({
  imports: [SequelizeModule.forFeature([Customer]), EventEmitterModule],
  controllers: [CustomerController],
  providers: [CustomerService, PaymentService],
})
export class CustomerModule {}
