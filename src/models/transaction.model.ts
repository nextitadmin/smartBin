import { Money } from '../common/utils/money';
import { Customer } from './customer.model';
import { SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SupportedCurrency } from '@common/constants';

export enum TransactionStatus {
  Abandoned = 'abandoned',
  Pending = 'pending',
  Successful = 'successful',
  Failed = 'failed',
}

export enum TransactionType {
  Topup = 'topup',
  Withdrawal = 'withdrawal',
  Transfer = 'transfer',
  BillPayment = 'billpayment',
  Fee = 'fee',
}

export interface TransactionAttributes {
  _id?: string;
  type: TransactionType;
  customer_id: string;
  wallet_id: string;
  reference: string;
  external_reference?: string;
  currency: SupportedCurrency;
  available_balance?: Money;
  ledger_balance?: Money;
  narration: string;
  status: TransactionStatus;
  meta?: any;
  createdAt?: string;
  updatedAt?: string;
}

@Schema({
  collection: 'transactions',
  timestamps: true,
  versionKey: false,
})
export class Transaction implements TransactionAttributes {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: Customer.name,
  })
  customer_id: string;
  @Prop({
    required: true,
    enum: Object.values(TransactionType),
  })
  type: TransactionType;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: Customer.name,
  })
  wallet_id: string;

  @Prop({
    required: true,
    type: SchemaTypes.Number,
  })
  amount: number;

  @Prop({
    required: true,
    type: SchemaTypes.String,
  })
  reference: string;

  @Prop({
    required: false,
    type: SchemaTypes.String,
  })
  external_reference: string;

  @Prop({
    required: false,
    type: SchemaTypes.Number,
    default: 0,
  })
  available_balance: number;

  @Prop({
    required: false,
    type: SchemaTypes.Number,
    default: 0,
    // set(this: Wallet, val: Money) {
    //   return setMoney(this, 'ledger_balance', val);
    // },
    // get(this: Wallet) {
    //   return getMoney(this, 'ledger_balance');
    // },
  })
  ledger_balance: number;

  @Prop({
    required: false,
    enum: Object.values(SupportedCurrency),
    default: SupportedCurrency.NGN,
  })
  currency: SupportedCurrency;

  @Prop({
    required: true,
    type: SchemaTypes.String,
  })
  narration: string;

  @Prop({
    required: false,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.Abandoned,
  })
  status: TransactionStatus;

  @Prop({
    required: false,
    type: SchemaTypes.Mixed,
  })
  meta: any;
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
// Indexes
TransactionSchema.index({
  customer_id: 1,
  reference: 1,
});
