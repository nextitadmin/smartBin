import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAttributes } from '../config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Flutterwave from 'flutterwave-node-v3';
import { CreateVirtualAccountAttributes } from './types/flutterwave.types';
import { generateRandomChars } from '../common/utils';

@Injectable()
export class FlutterwaveService {
  private flutterwaveInstance: Flutterwave;
  private logger = new Logger(FlutterwaveService.name);

  constructor(
    private readonly configService: ConfigService<ConfigAttributes>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const flutterwavePubKey = this.configService.get('flutterwave.publicKey', {
      infer: true,
    });
    const flutterwaveSecretKey = this.configService.get(
      'flutterwave.secretKey',
      {
        infer: true,
      },
    );
    this.flutterwaveInstance = new Flutterwave(
      flutterwavePubKey,
      flutterwaveSecretKey,
    ) as any;
  }

  async createVirtualAccount(payload: CreateVirtualAccountAttributes) {
    const virtualAccount = await this.flutterwaveInstance.VirtualAcct.create({
      ...payload,
      tx_ref: `LVA-${generateRandomChars(16)}`,
    });
    if (virtualAccount.status !== 'success') {
      throw new BadRequestException('Unable to create virtual wallet account');
    }

    return virtualAccount.data;
  }

  async getVirtualAccount(payload: Pick<CreateVirtualAccountAttributes, 'id'>) {
    const virtualAccount = await this.flutterwaveInstance.VirtualAcct.fetch(
      payload,
    );
    if (virtualAccount.status !== 'success') {
      throw new BadRequestException('Unable to get virtual wallet account');
    }

    return virtualAccount.data;
  }

  // async getVirtualAccounts() {
  //   return await this.flutterwaveInstance.VirtualAcct.
  // }
}
