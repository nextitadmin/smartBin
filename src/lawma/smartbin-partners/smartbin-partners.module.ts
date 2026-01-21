import { Module } from '@nestjs/common';
import { LawmaSmartbinPartnersService } from './smartbin-partners.service';
import { SmartbinPartnersController } from './smartbin-partners.controller';
import { SmartBinModule } from '@src/smart-bin/smart-bin.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SmartBinModule,
    AuthModule
  ],
  providers: [LawmaSmartbinPartnersService],
  controllers: [SmartbinPartnersController]
})
export class SmartbinPartnersModule { }
