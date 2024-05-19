import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { SuccessResponse } from '../common/http';

@Controller({ path: 'webhooks', version: '1' })
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('/paystack')
  @HttpCode(200)
  async handlePaystackWebhook(@Body() body: any) {
    await this.webhookService.handlePaystackPaymentNotification(body);
    return new SuccessResponse('Notification received', body);
  }

  @Post('/flutterwave')
  @HttpCode(HttpStatus.OK)
  async flutterwaveHook(@Body() body: any) {
    await this.webhookService.handleFlutterwaveWebhook(body);
    return new SuccessResponse('hook handled', null);
  }
}
