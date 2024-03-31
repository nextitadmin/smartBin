import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, SchemaTypes, Types } from 'mongoose';
import { Customer } from './customer.model';

export enum KycStatus {
  Apprvoed = 'approved',
  Disabled = 'disabled',
}

export enum KycTier {
  One = '1',
  Two = '2',
  Three = '3',
}

export interface KycAttributes {
  _id?: string;
  customer_id: Types.ObjectId | string | any;
  bvn: string;
  nin?: string;
  tier: KycTier;
  status: KycStatus;
}

@Schema({
  collection: 'kycs',
  timestamps: true,
  versionKey: false,
})
export class Kyc implements KycAttributes {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: Customer.name,
  })
  customer_id: Types.ObjectId;

  @Prop({
    required: false,
    type: SchemaTypes.String,
  })
  bvn: string;

  @Prop({
    required: false,
    type: SchemaTypes.String,
  })
  nin: string;

  @Prop({
    required: false,
    type: SchemaTypes.String,
    enum: Object.values(KycTier),
  })
  tier: KycTier;

  @Prop({
    required: false,
    enum: Object.values(KycStatus),
    default: KycStatus.Apprvoed,
  })
  status: KycStatus;
}

export const KycSchema = SchemaFactory.createForClass(Kyc);
