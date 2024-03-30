import { KycTier } from '../models/kyc.model';

interface KycUpgradedEventData {
  customer_id: string;
  tier: KycTier;
  bvn?: string;
  nin?: string;
}

export class KycUpgradedEvent {
  constructor(public data: KycUpgradedEventData) {}
}
