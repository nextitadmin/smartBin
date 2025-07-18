import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SequelizeModule } from '@nestjs/sequelize';
// import { Customer, CustomerSchema } from '../models/customer.model';
import { MongooseModule } from '@nestjs/mongoose';
// import { CustomerModule } from '@src/customer/customer.module';
// import { AgentServiceTsService } from './agent.service.ts/agent.service.ts.service';

@Module({
  // imports: [
  //   CustomerModule,
  //   MongooseModule.forFeature([
  //     { name: Customer.name, schema: CustomerSchema },
  //   ]),
  // ],
  // controllers: [AuthenticationController],
  // providers: [AuthenticationService, AgentServiceTsService],
})
export class AuthenticationModule {}
