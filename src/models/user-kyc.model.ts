import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { UserRole } from './types';

export enum IdVerificationStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  REJECTED = 'rejected',
}

export enum AddressVerificationStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  REJECTED = 'rejected',
}

export interface UserKycAttributes {
  userId: Types.ObjectId;
  userType: UserRole;
  lawmaCustomerType: string;
  ninNumber: string;
  idDocument: string;
  buildingType: string;
  houseNumber: string;
  flatNumber: string;
  address: string;
  localGovernment: string;
  closestLandmark: string;
  hasSubmittedPersonalInformation: boolean;
  hasSubmittedIdentity: boolean;
  hasSubmittedAddress: boolean;
  identityVerificationStatus: '';
  addressVerificationStatus: '';
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({
  collection: 'user_kycs',
  timestamps: true,
  versionKey: false,
})
export class UserKyc extends Document {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(UserRole),
    required: true,
  })
  userType: UserRole;

  @Prop({ type: SchemaTypes.String, required: false })
  lawmaCustomerType: string;

  @Prop({ type: SchemaTypes.String, required: false })
  ninNumber: string;

  @Prop({ type: SchemaTypes.String, required: false })
  idDocument: string;

  @Prop({ type: SchemaTypes.String, required: false })
  buildingType: string;

  @Prop({ type: SchemaTypes.String, required: false })
  houseNumber: string;

  @Prop({ type: SchemaTypes.String, required: false })
  flatNumber: string;

  @Prop({ type: SchemaTypes.String, required: false })
  address: string;

  @Prop({ type: SchemaTypes.String, required: false })
  localGovernment: string;

  @Prop({ type: SchemaTypes.String, required: false })
  closestLandmark: string;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  hasSubmittedPersonalInformation: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  hasSubmittedIdentity: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  hasSubmittedAddress: boolean;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(IdVerificationStatus),
    default: IdVerificationStatus.PENDING,
  })
  identityVerificationStatus: IdVerificationStatus;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(AddressVerificationStatus),
    default: AddressVerificationStatus.PENDING,
  })
  addressVerificationStatus: AddressVerificationStatus;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const UserKycSchema = SchemaFactory.createForClass(UserKyc);
