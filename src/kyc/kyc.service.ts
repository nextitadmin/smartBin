import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Kyc, KycStatus, KycTier } from '../models/kyc.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { events } from '../common/constants';
import { KycUpgradedEvent } from './kyc.event';
import { Model } from 'mongoose';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(Kyc.name) private readonly kycModel: Model<Kyc>,
    private ee: EventEmitter2,
  ) {}
  async enrollBvn({
    customer_id,
    bvn,
    tier,
  }: {
    customer_id: string;
    bvn: string;
    tier?: KycTier;
  }) {
    const kycEnrolled = await this.kycModel
      .findOne({
        customer_id,
      })
      .select('status bvn');

    if (kycEnrolled || kycEnrolled?.status === KycStatus.Disabled) {
      throw new BadRequestException(
        'Kyc enrolled already!, Please contact support!',
      );
    }

    const userKyc = await this.kycModel.create({
      customer_id,
      bvn,
      tier: tier || KycTier.One,
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

  async getCustomerKyc(customer_id: string) {
    return await this.kycModel.findOne({ customer_id }).select('status bvn');
  }
}
