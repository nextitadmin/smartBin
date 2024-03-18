import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer } from '../models/customer.model';

@Module({
  imports: [SequelizeModule.forFeature([Customer])],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
