import { Module } from '@nestjs/common';
import { AlatByWemaModule } from './alat-by-wema/alat-by-wema.module';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [AlatByWemaModule],
  providers: [],
})
export class IntegrationsModule {}
