import { BillPurchase } from '@src/utility/types';

export type TransactionEventDataTypes = BillPurchase | any;
export interface TransactionEventData {
  reference: string;
  data: TransactionEventDataTypes;
}

export class TransactionEvent {
  constructor(public data?: TransactionEventData) {}
}
