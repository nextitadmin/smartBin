export interface ValidateBillAttributes {
  itemCode: string;
  billCode: string;
  customerIdentifier: string;
  serviceId: string;
}

export interface PurchaseBillPayload extends ValidateBillAttributes {
  amount: number;
  customer_id: string;
}
