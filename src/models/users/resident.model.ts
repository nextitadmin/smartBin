import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { getHashedPassword } from '@common/utils';
import { Gender, UserRole, AccountStatus } from '@models/types';
import { Agent } from './agent.model';

export enum LawmaCustomerType {
  Returning = 'Returning',
  New = 'New',
}


export interface ResidentAttributes {
  agentId: Types.ObjectId;
  payerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
  phoneNumber?: string;
  nationality?: string;
  gender?: Gender;
  lawmaCustomerType?: LawmaCustomerType;
  pspCompany?: string;
  role: UserRole.Resident;
  address?: string;
  landmark?: string;
  nextPickupDate?: string;
  accountNo?: string;
  localGovermentArea?: string;
  buildingType?: string;
  password: string;
  registeredBy?: Types.ObjectId;
  registeredByModel?: 'Agent' | 'FacilityManager';
  loginCode?: string;
  loginCodeExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  status?: AccountStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({
  collection: 'residents',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Resident implements ResidentAttributes {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Agent.name,
    required: false,
  })
  agentId: Types.ObjectId;

  @Prop({
    // type: SchemaTypes.ObjectId,
    ref: 'Payer',
    required: true,
    unique: true,
  })
  payerId: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ lowercase: true, unique: true })
  email?: string;

  @Prop()
  profilePicture?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  nationality?: string;

  @Prop()
  pspCompany?: string;

  @Prop({
    type: String,
    enum: Object.values(Gender),
    default: Gender.Other,
  })
  gender?: Gender;

  @Prop({
    type: String,
    enum: Object.values(LawmaCustomerType),
    default: LawmaCustomerType.Returning,
  })
  lawmaCustomerType?: LawmaCustomerType;

  @Prop({
    type: String,
    enum: [UserRole.Resident],
    default: UserRole.Resident,
  })
  role: UserRole.Resident;

  @Prop()
  address?: string;

  @Prop()
  landmark?: string;

  @Prop()
  nextPickupDate?: string;

  @Prop()
  accountNo?: string;

  @Prop()
  localGovermentArea?: string;

  @Prop()
  buildingType?: string;


  @Prop({
    required: true,
    set: (val: string) => getHashedPassword(val),
  })
  password: string;

  @Prop()
  loginCode?: string;

  @Prop()
  loginCodeExpiry?: Date;

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpiry?: Date;

  @Prop({
    type: String,
    enum: Object.values(AccountStatus),
    default: AccountStatus.Active,
  })
  status?: AccountStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export type ResidentDocument = Resident & Document;
export const ResidentSchema = SchemaFactory.createForClass(Resident);
