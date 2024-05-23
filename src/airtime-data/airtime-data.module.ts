import { Module } from '@nestjs/common';
import { AirtimeDataService } from './airtime-data.service';
import { AirtimeDataController } from './airtime-data.controller';
import { VTPassService } from '@src/providers/vtpass.service';
import { HttpModule } from '@nestjs/axios';
import { CustomerModule } from '@src/customer/customer.module';

@Module({
  imports: [HttpModule, CustomerModule],
  providers: [AirtimeDataService, VTPassService],
  controllers: [AirtimeDataController],
})
export class AirtimeDataModule {}
