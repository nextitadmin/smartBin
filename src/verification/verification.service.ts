import { events } from '@common/constants';
import { Verification } from '@models/verification.model';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BeneficiaryAddedEvent, VerificationVerifiedEvent } from './dto';
import { Beneficiary } from '@models/beneficiary.model';

@Injectable()
export class VerificationService {
  constructor(
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<Verification>,
    @InjectModel(Beneficiary.name)
    private readonly beneficiaryModel: Model<Beneficiary>,
  ) {}

  private logger = new Logger(VerificationService.name);

  @OnEvent(events.verification.verified)
  async handleVerificationVerified(event: VerificationVerifiedEvent) {
    const identifierExists = await this.verificationModel.findOne({
      identifier: event.data.identifier,
    });
    if (identifierExists) {
      identifierExists.data = event.data.data;
      await identifierExists.save();
      return this.logger.warn(
        'Verification identifier already exists and updated',
      );
    }
    await new this.verificationModel({ ...event.data }).save();
  }

  @OnEvent(events.beneficiary.added)
  async handleBeneficiaryAdded(event: BeneficiaryAddedEvent) {
    const verificationId = await this.verificationModel
      .findOne({
        identifier: event.data.identifier,
      })
      .select('_id');
    if (!verificationId) {
      return this.logger.warn(
        'unable to find existing verification with identifier ' +
          event.data.identifier,
      );
    }

    const identifierExists = await this.beneficiaryModel.findOne({
      customerId: event.data.customerId,
      verificationId: String(verificationId._id),
    });
    if (identifierExists) {
      return this.logger.warn('Beneficiary already exists!');
    }
    await new this.beneficiaryModel({
      customerId: event.data.customerId,
      verificationId: String(verificationId._id),
    }).save();
  }
}
