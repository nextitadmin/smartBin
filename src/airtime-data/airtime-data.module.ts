import { Module } from '@nestjs/common';
import { AirtimeDataService } from './airtime-data.service';
import { AirtimeDataController } from './airtime-data.controller';
import { VTPassService } from '@src/providers/vtpass.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AirtimeDataService, VTPassService],
  controllers: [AirtimeDataController],
})
export class AirtimeDataModule {}
