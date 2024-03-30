import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, SchemaTypes, Types } from 'mongoose';

export enum CustomerStatus {
  Pending = 'pending',
  Active = 'active',
  Inactive = 'inactive',
  Disabled = 'disabled',
}

export interface CustomerAttributes {
  _id?: string | Types.ObjectId;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  passcode: string;
  status: CustomerStatus;
  tag?: string;
  firebaseTokens?: string[];
  deleted_at?: Date;
}

@Schema({
  collection: 'customers',
  timestamps: true,
  versionKey: false,
})
export class Customer extends Model<CustomerAttributes> {
  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  first_name: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  last_name: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  email: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  phone: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  passcode: string;

  @Prop({
    type: SchemaTypes.String,
  })
  tag?: string;

  @Prop({
    type: SchemaTypes.Mixed,
  })
  firebaseTokens: string[];

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(CustomerStatus),
    default: CustomerStatus.Active,
  })
  status: CustomerStatus;

  @Prop({
    type: SchemaTypes.String,
    default: null,
  })
  deleted_at?: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
