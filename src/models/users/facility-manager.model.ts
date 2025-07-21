import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '@models/types'; // adjust if needed
import { getHashedPassword } from '@common/utils'; // adjust if needed

export interface FacilityManagerAttributes {
  payerId: string;
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  password: string;
  role: UserRole.Facility;
  loginCode?: string;
  loginCodeExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({
  collection: 'facilitymanagers',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class FacilityManager implements FacilityManagerAttributes {
  @Prop({ required: true, unique: true })
  payerId: string;

  @Prop({ required: true, unique: true })
  organizationName: string;

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

  @Prop({ enum: [UserRole.Facility], default: UserRole.Facility })
  role: UserRole.Facility;

  @Prop({ default: null })
  loginCode?: string;

  @Prop({ default: null })
  loginCodeExpires?: Date;

  @Prop({ default: null })
  resetToken?: string;

  @Prop({ default: null })
  resetTokenExpires?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type FacilityManagerDocument = FacilityManager & Document;
export const FacilityManagerSchema =
  SchemaFactory.createForClass(FacilityManager);
