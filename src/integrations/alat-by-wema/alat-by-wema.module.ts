import { Module } from '@nestjs/common';
import { AlatByWemaService } from './alat-by-wema.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AlatByWemaService],
})
export class AlatByWemaModule {}
