import { Module } from '@nestjs/common';
import { LawmaPartnerAuthController } from './auth/auth.controller';
import { LawmaPartnerAuthService } from './auth/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Administrator, AdministratorSchema } from '@models/administrator.model';


@Module({
 imports: [
      MongooseModule.forFeature([
        { name: Administrator.name, schema: AdministratorSchema },
      ]),
    ],
  controllers: [LawmaPartnerAuthController ],
  providers: [LawmaPartnerAuthService],
    exports: [LawmaPartnerAuthService],
})
export class LawmaPartnerModule {


}
