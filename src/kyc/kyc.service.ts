import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Kyc, KycStatus, KycTier } from '../models/kyc.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { events } from '../common/constants';
import { KycUpgradedEvent } from './kyc.event';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(Kyc) private readonly kyc: typeof Kyc,
    private ee: EventEmitter2,
  ) {}
  async enrollBvn({ customer_id, bvn }: { customer_id: number; bvn: string }) {
    const kycEnrolled = await this.kyc.findOne({
      where: {
        customer_id,
      },
      attributes: ['id', 'status', 'bvn'],
    });

    if (kycEnrolled || kycEnrolled?.status === KycStatus.Disabled) {
      throw new BadRequestException(
        'Kyc enrolled already!, Please contact support!',
      );
    }

    const userKyc = await this.kyc.create({
      customer_id,
      bvn,
      tier: KycTier.Two,
      nin: 'N/A',
    });
    await userKyc.save();

    this.ee.emit(
      events.kyc.upgraded,
      new KycUpgradedEvent({
        customer_id,
        bvn,
        tier: userKyc.tier as KycTier,
      }),
    );
  }

  async getKycByCustomer(customer_id: number) {
    return await this.kyc.findOne({
      where: { customer_id },
      attributes: ['id', 'status', 'bvn'],
    });
  }
}
