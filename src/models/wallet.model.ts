import { Money } from '../common/utils/money';
import { Customer } from './customer.model';
import { Model, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum WalletStatus {
  Pending = 'pending',
  Active = 'active',
  Disabled = 'disabled',
}

export enum SupportedCurrency {
  NGN = 'NGN',
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
}

export interface WalletAttributes {
  _id?: string;
  customer_id: string;
  wallet_id: string;
  external_wallet_id: string;
  bank_name: string;
  account_number: string;
  currency: SupportedCurrency;
  available_balance: Money;
  ledger_balance: Money;
  note?: string;
  status: WalletStatus;
}

@Schema({
  collection: 'wallets',
  timestamps: true,
  versionKey: false,
})
export class Wallet implements WalletAttributes {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: Customer.name,
  })
  customer_id: string;

  @Prop({
    required: false,
    type: SchemaTypes.String,
  })
  bank_name: string;

  @Prop({
    required: false,
    type: SchemaTypes.String,
  })
  account_number: string;

  @Prop({
    required: false,
    type: SchemaTypes.String,
  })
  wallet_id: string;

  @Prop({
    required: false,
    type: SchemaTypes.String,
  })
  external_wallet_id: string;

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
  note: string;

  @Prop({
    required: false,
    enum: Object.values(WalletStatus),
    default: WalletStatus.Pending,
  })
  status: WalletStatus;
}
export const WalletSchema = SchemaFactory.createForClass(Wallet);
