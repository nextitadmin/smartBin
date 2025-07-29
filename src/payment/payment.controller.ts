import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';
import { PaymentNotificationDTO } from './dto/payment.dto';

@ApiTags('Payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('notification')
  async handlePaymentNotification(@Body() body: PaymentNotificationDTO) {
    const response = await this.paymentService.handlePaymentNotification(body);
    return new SuccessResponse(
      'Payment notification processed successfully',
      response,
    );
  }
}
