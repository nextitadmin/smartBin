import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { UserRole } from '@models/types'; // Adjust this path as needed
import { getHashedPassword } from '@common/utils'; // Adjust if needed
import { Agent } from './agent.model';

export interface CorporateAttributes {
  agentId?: Types.ObjectId;
  payerId: string;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  password: string;
  role: UserRole.Corporate;
  registeredBy?: Types.ObjectId;
  registeredByModel?: 'Agent';
  loginCode?: string;
  loginCodeExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Corporate implements CorporateAttributes {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Agent.name,
    required: false,
  })
  agentId?: Types.ObjectId;
  @Prop({ required: true, unique: true })
  payerId: string;

  @Prop({ required: true, unique: true })
  businessName: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  profilePicture?: string;

  @Prop()
  phoneNumber?: string;

  @Prop({
    required: true,
    set: (val: string) => getHashedPassword(val),
  })
  password: string;

  @Prop({ enum: [UserRole.Corporate], default: UserRole.Corporate })
  role: UserRole.Corporate;

  @Prop({ type: Types.ObjectId, refPath: 'registeredByModel', default: null })
  registeredBy?: Types.ObjectId;

  @Prop({ type: String, enum: ['Agent'], default: null })
  registeredByModel?: 'Agent';

  @Prop()
  loginCode?: string;

  @Prop()
  loginCodeExpiry?: Date;

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpires?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type CorporateDocument = Corporate & Document;

export const CorporateSchema = SchemaFactory.createForClass(Corporate);
