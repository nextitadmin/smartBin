import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

import { UserRole } from './types';
import { Wallet } from './wallet.model';

export enum TransactionStatus {
  Abandoned = 'abandoned',
  Pending = 'pending',
  Successful = 'successful',
  Failed = 'failed',
}

export enum TransactionAction {
  PayNow = 'pay now',
  Paid = 'paid',
  WalletTopUp = 'wallet_topup',
}

export enum PaymentMethod {
  AlatByWema = 'Alat',
  Wallet = 'wallet',
}

export enum ServiceType {
  WasteDisposal = 'Waste Bin Disposal',
  Subscription = 'Subscription',
  SmartBinPurchase = 'Smart Bin Purchase',
  WalletTopUp = 'Wallet Top-Up',
}

export interface TransactionAttributes {
  userId: Types.ObjectId;
  userType: UserRole;
  walletId?: Types.ObjectId;
  amount: number;
  transactionReference: string;
  status: TransactionStatus;
  service: ServiceType;
  paymentMethod: PaymentMethod;
  gatewayResponse?: Record<string, any>;
  description?: string;
  createdAt?: Date;
  completedAt?: Date;
}

@Schema({ timestamps: true })
export class Transaction implements TransactionAttributes {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Wallet.name,
  })
  walletId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(UserRole),
  })
  userType: UserRole;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, unique: true })
  transactionReference: string;

  @Prop({
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.Abandoned,
  })
  status: TransactionStatus;

  @Prop({
    type: String,
    enum: Object.values(ServiceType),
    required: true,
  })
  service: ServiceType;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
    default: PaymentMethod.Wallet,
  })
  paymentMethod: PaymentMethod;

  @Prop({ type: Object })
  gatewayResponse?: Record<string, any>;

  @Prop()
  description?: string;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({
    required: false,
    type: SchemaTypes.Mixed,
  })
  meta: any;
}

export type TransactionDocument = Transaction & Document;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({
  userId: 1,
  transactionReference: 1,
});
