import { getHashedPassword } from '@common/utils';
import { Gender, UserRole } from '@models/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export enum AgentStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

export enum AgentIdType {
  NIN = 'NIN',
  DRIVERS_LICENSE = 'Drivers_License',
  VOTERS_CARD = 'Voters_Card',
  INTERNATIONAL_PASSPORT = 'International_Passport',
}

export interface AgentAddressAttributes {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AgentAtributes {
  _id?: string | Types.ObjectId;
  payerId: string;
  agencyName: string;
  businessEmail: string;
  addresses: AgentAddressAttributes[];
  regNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  gender: Gender;
  idType: AgentIdType;
  idNumber: string;
  role: UserRole.Agent;
  password: string;
  profilePicture: string;
  status: AgentStatus;
  loginCode: string;
  loginCodeExpiry: Date;
  deleted_at?: Date;
}

@Schema({
  collection: 'agents',
  id: true,
  timestamps: true,
  versionKey: false,
})
export class Agent implements AgentAtributes {
  @Prop({ type: SchemaTypes.String, required: true })
  payerId: string;

  @Prop({ type: SchemaTypes.String, required: true })
  agencyName: string;

  @Prop({ type: SchemaTypes.String, })
  businessEmail: string;

  @Prop({ type: [Object], })
  addresses: AgentAddressAttributes[];

  @Prop({ type: SchemaTypes.String, })
  regNumber: string;

  @Prop({ type: SchemaTypes.String, })
  firstName: string;

  @Prop({ type: SchemaTypes.String })
  lastName: string;

  @Prop({ type: SchemaTypes.String, required: true })
  email: string;

  @Prop({ type: SchemaTypes.String, })
  phoneNumber: string;

  @Prop({ type: SchemaTypes.String })
  nationality: string;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(Gender),
    required: true,
  })
  gender: Gender;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(AgentIdType),
    required: true,
  })
  idType: AgentIdType;

  @Prop({ type: SchemaTypes.String, })
  idNumber: string;

  @Prop({
    type: SchemaTypes.String,
    enum: [UserRole.Agent],
    default: UserRole.Agent,
  })
  role: UserRole.Agent;

  @Prop({
    type: SchemaTypes.String,
    required: true,
    set: (val: string) => getHashedPassword(val),
  })
  password: string;

  @Prop({ type: SchemaTypes.String })
  profilePicture: string;

  @Prop({ type: SchemaTypes.String })
  loginCode: string;

  @Prop({ type: SchemaTypes.String })
  loginCodeExpiry: Date;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(AgentStatus),
    default: AgentStatus.Active,
  })
  status: AgentStatus;

  @Prop({ type: Date, default: null })
  deleted_at?: Date;
}


export type AgentDocument = Agent & Document;

export const AgentSchema = SchemaFactory.createForClass(Agent);


AgentSchema.virtual('residents', {
  ref: 'Resident',
  localField: '_id',
  foreignField: 'registeredBy',
  match: { registeredByModel: 'Agent' },
});

// Virtual for Corporates registered by this Agent
AgentSchema.virtual('corporates', {
  ref: 'Corporate',
  localField: '_id',
  foreignField: 'registeredBy',
  match: { registeredByModel: 'Agent' },
});