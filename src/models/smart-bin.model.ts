import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { UserRole } from './types';

export enum SmartbinStatus {
  Pending = 'pending',
  Approved = 'approved',
  Diclined = 'declined',
}

export enum BinType {
  Smart = 'smart',
  Non_Smart = 'non_smart',
}

export enum LAWMACustomerType {
  Returning = 'Returning',
  New = 'New',
}

export enum PaymentMethod {
  AlatByWema = 'Alat',
  Wallet = 'wallet',
}

export interface SmartBinAttributes {
  _id?: string;
  userId: Types.ObjectId;
  payerId: string;
  binType: BinType;
  status: SmartbinStatus;
  customerType: UserRole;
  lawmaCustomerType?: LAWMACustomerType;
  paymentMethod?: PaymentMethod;
  buildingName?: string;
  address?: string;
  businessType?: string;
  email?: string;
  phoneNumber?: string;
  amount?: number;
  branch?: string;
  closestLandmark?: string;
  useYourAddress?: boolean;
  streetName?: string;
  name?: string;
  businessName?: string;
  buildingType?: string;
  houseName?: string;
  houseNumber?: string;
  transactionReference?: string;
  flatNumber?: string;
  localGovernmentArea?: string;
  approvalDate?: Date;
  deliveredOn?: Date;
  deliveredBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  applicationHistory: [
    {
      timestamp: Date; // date
      status: string; // activated, delivered, scheduledForDelivery, delivered, cancelled //enum
      description: string;
    },
  ];
}

@Schema({ _id: false })
class ApplicationHistoryItem {
  @Prop({ type: Date, required: true })
  timestamp: Date;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: true })
  description: string;
}

const ApplicationHistoryItemSchema = SchemaFactory.createForClass(
  ApplicationHistoryItem,
);

@Schema({
  collection: 'smart_bins',
  timestamps: true,
  versionKey: false,
})
export class SmartBin extends Document {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  payerId: string;

  @Prop({
    type: String,
    enum: Object.values(BinType),
    default: BinType.Smart,
  })
  binType: BinType;

  @Prop({
    type: String,
    enum: Object.values(SmartbinStatus),
    default: SmartbinStatus.Pending,
  })
  status: SmartbinStatus;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.Resident,
  })
  customerType: UserRole;

  @Prop({
    type: String,
    enum: Object.values(LAWMACustomerType),
    default: LAWMACustomerType.New,
  })
  lawmaCustomerType?: LAWMACustomerType;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    default: PaymentMethod.Wallet,
  })
  paymentMethod?: PaymentMethod;

  @Prop({
    type: Boolean,
    default: false,
  })
  useYourAddress?: boolean;

  @Prop({ type: SchemaTypes.String, required: true, unique: true })
  transactionReference?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  streetName?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  buildingName?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  address?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  businessType?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  email?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  phoneNumber?: string;

  @Prop({ type: SchemaTypes.Number, required: false })
  amount?: number;

  @Prop({ type: SchemaTypes.String, required: false })
  branch?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  closestLandmark?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  name?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  businessName?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  buildingType?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  houseName?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  houseNumber?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  flatNumber?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  localGovernmentArea?: string;

  @Prop({ type: [ApplicationHistoryItemSchema], default: [] })
  applicationHistory: ApplicationHistoryItem[];
}

export const SmartBinSchema = SchemaFactory.createForClass(SmartBin);
