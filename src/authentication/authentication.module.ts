import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer, CustomerSchema } from '../models/customer.model';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from '@src/customer/customer.module';

@Module({
  imports: [
    CustomerModule,
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
