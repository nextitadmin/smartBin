import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly configService: ConfigService) {
    // this.flutterwave = new Flutterwave(
    //   this.configService.get<string>('FLUTTERWAVE_PUBLIC_KEY'),
    //   this.configService.get<string>('FLUTTERWAVE_SECRET_KEY'),
    // );
  }

  async handlePaymentNotification(notification: any): Promise<any> {
    this.logger.log('Received payment notification', notification);
    // Process the notification here
    // For example, update the payment status in the database
    return null;
  }
  async verifyPayment(reference: string): Promise<any> {
    // const payload = {
    //   tx_ref: reference,
    // };
    // try {
    //   const response = await this.flutterwave.Transaction.verify(payload);
    //   if (response.status === 'success') {
    //     return response;
    //   }
    // } catch (error) {
    //   this.logger.error(error);
    //   return null;
    // }
  }
}
