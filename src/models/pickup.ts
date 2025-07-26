import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Payer } from '@models/users/payer.model';

export type PickupDocument = Pickup & Document;

export enum Status {
  Pending = 'Pending',
  Picked = 'pickedUp',
  Cancelled = 'cancelled',
  Delivered = 'delivered',
}

export enum CustomerType {
  Resident = 'Resident',
  Corporate = 'Corporate',
  Facility = 'Facility',
  Agent = 'Agent',
}

export enum PaymentMethod {
  AlatByWema = 'Alat',
  Wallet = 'wallet',
}

export interface PickupAttributes {
  _id: string;
  payerId: string;
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
  customerType?: CustomerType;
  issuedOn?: String;
  paymentDue?: String;
  location?: string 
  createdAt?: Date;
  updatedAt?: Date;
}
@Schema({ timestamps: true })
export class Pickup {
  @Prop({ required: true })
  date: Date;

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
  payerId: string;

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

  @Prop()
  paymentMethod?: PaymentMethod;

  @Prop()
  time?: string;

  @Prop()
  notification?: string;

  @Prop()
  customerType?: CustomerType;

  @Prop()
  issuedOn?: String;

  @Prop()
  paymentDue?: String;

  @Prop()
  location?: string 
}

export const PickupSchema = SchemaFactory.createForClass(Pickup);