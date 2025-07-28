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
  firstName: string;
  lastName: string;
  email: string;
  date: Date;
  address: string;
  billReference?: string;
  description?: string;
  amount?: number;
  representative?: string;
  phoneNumber?: string;
  customerName?: string;
  branch?: string;
  nextPickupDate?: Date;
  residentLocation?: string;
  agentNote?: string;
  status?: Status;
  paymentMethod?: PaymentMethod;
  time?: string;
  notification?: string;
  issuedOn?: Date;
  paymentDue?: Date;
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({
  timestamps: true,
  collection: 'waste_management_pickups',
  versionKey: false,
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

  @Prop({ default: 'Pending' })
  status: string;

  // Facility Manager field
  @Prop()
  customerName?: string;

  // Corporate fields
  @Prop()
  branch?: string;

  @Prop()
  nextPickupDate?: Date;

  @Prop()
  agentNote?: string; // Add agent-specific info here if needed

  @Prop({ required: true })
  wasteId: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phoneNumber?: string;

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
    required: true,
  })
  paymentMethod?: PaymentMethod;

  @Prop()
  time?: string;

  @Prop()
  notification?: string;

  @Prop()
  issuedOn?: Date;

  @Prop()
  paymentDue?: Date;

  @Prop()
  location?: string;
}

export const PickupSchema = SchemaFactory.createForClass(Pickup);
