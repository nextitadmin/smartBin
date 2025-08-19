import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { UserRole } from './types';
import { PaymentMethod } from './transaction.model';

export type PickupDocument = Pickup & Document;

export enum Status {
  Pending = 'pending',
  Cancelled = 'cancelled',
  Delivered = 'delivered',
  Completed = 'completed',
}

export interface PickupAttributes {
  _id: string;
  accountId: Types.ObjectId;
  accountType: UserRole;
  wasteId: string;
  address: string;
  billReference?: string;
  description?: string;
  amount?: number;
  representative?: string;
  phoneNumber?: string;
  customerName?: string;
  branch?: string;
  pickupDate?: string;
  pickupTime?: string;
  nextPickupDate?: Date;
  residentLocation?: string;
  agentNote?: string;
  status?: Status;
  paymentMethod?: PaymentMethod;
  time?: string;
  weight?: number;
  notification?: string;
  issuedOn?: Date;
  paymentDue?: Date;
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
  transactionReference?: string;
  customerName?: string;
}

@Schema({
  timestamps: true,
  collection: 'waste_management_pickups',
  versionKey: false,
  virtuals: true,
})
export class Pickup {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
  })
  accountId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(UserRole),
    required: true,
  })
  accountType: UserRole;

  @Prop({ required: true })
  address: string;

  @Prop()
  representative?: string;

  @Prop({ enum: Object.values(Status), default: Status.Pending })
  status: Status;

  // Facility Manager field
  @Prop()
  customerName?: string;

  // Corporate fields
  @Prop()
  branch?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  pickupDate?: string;

  @Prop()
  pickupTime?: string;

  @Prop()
  nextPickupDate?: Date;

  @Prop()
  agentNote?: string;

  @Prop()
  wasteId: string;

  @Prop()
  residentLocation?: string;

  @Prop()
  description?: string;

  @Prop()
  amount?: number;

  @Prop()
  billReference?: string;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(PaymentMethod),
  })
  paymentMethod?: PaymentMethod;

  @Prop()
  time?: string;

  @Prop({ default: 20 })
  weight?: number;

  @Prop()
  notification?: string;

  @Prop()
  transactionReference?: string;

  @Prop()
  issuedOn?: Date;

  @Prop()
  paymentDue?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PickupSchema = SchemaFactory.createForClass(Pickup);

PickupSchema.virtual('payment', {
  ref: 'Transaction',
  localField: 'transactionReference',
  foreignField: 'transactionReference',
  justOne: true,
  options: { select: 'amount status -_id' },
});
