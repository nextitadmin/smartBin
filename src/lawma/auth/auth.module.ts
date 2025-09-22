import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Administrator,
  AdministratorSchema,
} from '@models/administrator.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Administrator.name, schema: AdministratorSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
