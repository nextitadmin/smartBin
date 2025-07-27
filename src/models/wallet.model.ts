import { Model, SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum WalletStatus {
  Pending = 'pending',
  Active = 'active',
  Disabled = 'disabled',
}

export enum SupportedCurrency {
  NGN = 'NGN',
}

export interface WalletAttributes {
  _id?: string;
  userId: Types.ObjectId;
  available_balance: number;
  ledger_balance: number;
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
  })
  userId: Types.ObjectId;

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
    required: false,
    enum: Object.values(WalletStatus),
    default: WalletStatus.Pending,
  })
  status: WalletStatus;
}
export const WalletSchema = SchemaFactory.createForClass(Wallet);
