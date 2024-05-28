import { BeneficiaryAttributes } from '@models/beneficiary.model';
import { VerificationAttributes } from '@models/verification.model';

export class VerificationVerifiedEvent {
  constructor(public data: Partial<VerificationAttributes>) {}
}

export type BeneficiaryAddedEventData = Pick<
  VerificationAttributes,
  'identifier'
> & {
  customerId: string;
};
export class BeneficiaryAddedEvent {
  constructor(public data: BeneficiaryAddedEventData) {}
}
