import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Flutterwave from 'flutterwave-node-v3';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private flutterwave: Flutterwave;

  constructor(private readonly configService: ConfigService) {
    this.flutterwave = new Flutterwave(
      this.configService.get<string>('FLUTTERWAVE_PUBLIC_KEY'),
      this.configService.get<string>('FLUTTERWAVE_SECRET_KEY'),
    );
  }

  async verifyPayment(reference: string): Promise<any> {
    const payload = {
      tx_ref: reference,
    };

    try {
      const response = await this.flutterwave.Transaction.verify(payload);
      if (response.status === 'success') {
        return response;
      }
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async createVirtualAccount() {
    const virtualAccountCreate = await this.flutterwave.VirtualAcct.create({
      email: 'codergab+2@gmail.com',
      is_permanent: true,
      tx_ref: 'RX1' + Math.floor(Math.random() * 1000000000 + 1),
      bvn: '22263342516',
    });

    console.log({ virtualAccountCreate }, virtualAccountCreate.data.order_ref);

    const virtualAccount = await this.getVirtualAccount(
      virtualAccountCreate.data.order_ref,
    );

    console.log({ virtualAccount });
  }

  async getVirtualAccount(id: string) {
    const virtualAccount = await this.flutterwave.VirtualAcct.fetch({
      order_ref: id,
    });
    console.log({ virtualAccount });
  }
}
