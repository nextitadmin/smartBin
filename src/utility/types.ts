export interface ValidateBillAttributes {
  itemCode: string;
  billCode: string;
  customerIdentifier: string;
  serviceId: string;
}

export interface PurchaseBillPayload extends ValidateBillAttributes {
  amount: number;
  customer_id: string;
  beneficiary: string;
}

export enum BillPurchaseStatus {
  Pending = 'pending',
  Delivered = 'delivered',
  Reversed = 'reversed',
}
export interface BillPurchase {
  status: BillPurchaseStatus;
  product_name: string;
  unique_element: string;
  amount: number;
}
