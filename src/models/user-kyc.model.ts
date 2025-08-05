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

export enum SignatoryVerificationStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  REJECTED = 'rejected',
}

export interface UserKycAttributes {
  userId: Types.ObjectId;
  userType: UserRole;
  lawmaCustomerType?: string;
  idDocumentNo?: string;
  idDocument?: string;
  buildingType?: string;
  houseNumber?: string;
  flatNumber?: string;
  address?: string;
  localGovernment?: string;
  closestLandmark?: string;
  signatories?: Types.ObjectId[];
  hasSubmittedPersonalInformation?: boolean;
  hasSubmittedIdentity?: boolean;
  hasSubmittedAddress?: boolean;
  hasSubmittedSignatories?: boolean;
  identityVerificationStatus?: IdVerificationStatus;
  addressVerificationStatus?: AddressVerificationStatus;
  signatoryVerificationStatus?: SignatoryVerificationStatus;
  businessRegistrationNumber?: string;
  businessSector?: string;
  hasCompletedKyc?:boolean;
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
  idDocumentNo: string;

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

  @Prop({ type: [{ type: SchemaTypes.ObjectId }], required: false })
  signatories: Types.ObjectId[];

  @Prop({ type: SchemaTypes.Boolean, default: false })
  hasSubmittedPersonalInformation: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  hasSubmittedIdentity: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  hasSubmittedAddress: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  hasSubmittedSignatories: boolean;

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

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(SignatoryVerificationStatus),
    default: SignatoryVerificationStatus.PENDING,
  })
  signatoryVerificationStatus: SignatoryVerificationStatus;

  @Prop({ type: SchemaTypes.String, required: false })
  businessRegistrationNumber: string;

  @Prop({ type: SchemaTypes.String, required: false })
  businessSector: string;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  hasCompletedKyc: boolean;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const UserKycSchema = SchemaFactory.createForClass(UserKyc);
