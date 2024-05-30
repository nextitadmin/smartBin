import { SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Customer } from './customer.model';
import { Verification } from './verification.model';

export enum BeneficiaryProductType {
  Utility = 'utility',
  AirtimeData = 'airtime-data',
}
export interface BeneficiaryAttributes {
  _id?: string;
  productType: BeneficiaryProductType;
  customerId: string;
  verificationId: string;
  createdAt?: string;
}

@Schema({
  collection: 'beneficiaries',
  timestamps: true,
  versionKey: false,
})
export class Beneficiary implements BeneficiaryAttributes {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: Customer.name,
  })
  customerId: string;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: Verification.name,
  })
  verificationId: string;
  @Prop({
    required: true,
    type: SchemaTypes.String,
    enum: Object.values(BeneficiaryProductType),
  })
  productType: BeneficiaryProductType;
}
export const BeneficiarySchema = SchemaFactory.createForClass(Beneficiary);

BeneficiarySchema.virtual('detail', {
  localField: 'verificationId',
  foreignField: '_id',
  justOne: true,
  ref: Verification.name,
});
