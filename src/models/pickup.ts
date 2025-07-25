import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type PickupDocument = Pickup & Document;

export enum PickupStatus {
  Pending = 'Pending',
  Picked = 'pickedUp',
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
}

export const PickupSchema = SchemaFactory.createForClass(Pickup);
export interface PickupInterface {
  _id: string;
  date: Date;
  address: string;
  representative?: string;
  status?: string;
  customerName?: string;
  branch?: string;
  nextPickupDate?: Date;
  residentLocation?: string;
  agentNote?: string;
  pickupUpStatus?: PickupStatus;
  createdAt?: Date;
  updatedAt?: Date;
  

}