export interface BillPurchasedEventData {
  reference: string;
}

export class BillPurchasedEvent {
  constructor(public data: BillPurchasedEventData) {}
}
