import { Module } from '@nestjs/common';
import { VTPassService } from './vtpass.service';
import { HttpModule } from '@nestjs/axios';
import { PaystackService } from './paystack.service';
import { ProviderController } from './providers.controller';
import { ProvidersService } from './providers.service';

@Module({
  imports: [HttpModule],
  controllers: [ProviderController],
  providers: [ProvidersService, PaystackService, VTPassService],
  exports: [ProvidersService, PaystackService, VTPassService],
})
export class ProvidersModule {}
