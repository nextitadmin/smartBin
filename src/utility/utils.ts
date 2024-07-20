import { BillPurchaseStatus } from './types';

export const formatToken = (token: string) =>
  token && token.includes('Token') ? token.split(':')[1].trim() : token;

export const formatUtilityResponse = (transaction: any) => ({
  customer_name: transaction.meta.CustomerName || transaction.meta.customerName,
  customer_address:
    transaction.meta.CustomerAddress || transaction.meta.customerAddress,
  unit: transaction.meta.Units || transaction.meta.units, // it's being sent as lowercase sometimes
  product_name: transaction.meta.content.transactions.product_name,
  amount: transaction.meta.amount,
  // status: transaction.status,
  transaction_date: transaction.meta.transaction_date.date,
  customer_id: transaction.meta.content.transactions.unique_element,
  extra: formatToken(transaction.meta.Token || transaction.meta.token),
  fee: 100,
  status: formatBillPurchaseStatus(
    transaction.meta.content.transactions.status,
  ),
});

export const formatBillPurchaseStatus = (status: BillPurchaseStatus) => {
  if (status === 'pending') {
    return 'pending';
  }
  if (status === 'delivered') {
    return 'successful';
  }

  return 'reversed';
};
