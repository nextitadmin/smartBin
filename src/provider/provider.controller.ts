import { Body, Controller, Post } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { SuccessResponse } from '@common/http';

@Controller({ path: 'providers', version: '1' })
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post('/paystack/webhook')
  async handlePaystackWebhook(@Body() body: any) {
    await this.providerService.handlePaystackWebhook(body);
    return new SuccessResponse('Webhook received', body);
  }
}
