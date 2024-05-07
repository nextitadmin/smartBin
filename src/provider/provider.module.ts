import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { PaystackService } from './paystack.service';
import { ProviderController } from './provider.controller';

@Module({
  imports: [HttpModule],
  providers: [ProviderService, PaystackService],
  exports: [ProviderService],
  controllers: [ProviderController],
})
export class ProviderModule {}
