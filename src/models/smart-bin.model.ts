import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { UserRole } from './types';
import { Transaction } from './transaction.model';
import { Type } from 'class-transformer';
import { Lga, LGAAttributes } from './lgas.model';
import { string } from 'joi';

export enum SmartbinStatus {
  Pending = 'pending',
  Inventory = 'inventory',
  ScheduledForDelivery = 'scheduledForDelivery',
  Delivered = 'delivered',
  Activated = 'activated',
  Cancelled = 'cancelled',
  Approved = 'approved',
  Declined = 'declined',
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

export enum BinAssignmentStatus {
  Assigned = 'assigned',
  Unassigned = 'unassigned',
}
export enum RecieverType {
  OWNER = 'owner',
  RELATIVE = 'relative',
  ACQUAINTANCE = 'acquaintance',
}
export const DEFAULT_SMART_BIN_AMOUNT = 100000;
export interface SmartBinAttributes {
  _id?: string;
  agentId?: string;
  userId: Types.ObjectId;
  facilityId?: Types.ObjectId;
  payerId: string;
  binType: BinType;
  status: SmartbinStatus;
  assignedTo?: Types.ObjectId;
  assignmentStatus?: BinAssignmentStatus;
  customerType: UserRole;
  lawmaCustomerType?: LAWMACustomerType;
  paymentMethod?: PaymentMethod;
  buildingName?: string;
  address?: string;
  businessType?: string;
  email?: string;
  phoneNumber?: string;
  amount?: number;
  quantity?: number;
  branch?: string;
  binId?: string;
  branchId: string;
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
  lgaId?: Types.ObjectId;
  approvalDate?: Date;
  deliveredOn?: Date;
  deliveredBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  receiverName?: string;
  receiverType?: RecieverType;

  applicationHistory: [
    {
      timestamp: Date;
      status: string;
      description: string;
      updatedBy?: string;
      updatedByName?: string;
    },
  ];
}

export type SmartbinDocument = SmartBinAttributes & Document;

@Schema({ _id: false })
class ApplicationHistoryItem {
  @Prop({ type: Date, required: true })
  timestamp: Date;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: SchemaTypes.ObjectId, required: false })
  updatedBy?: Types.ObjectId; // Can store team member ID or name

  @Prop({ type: SchemaTypes.String, required: false })
  updatedByName?: string; // Store the name for easy display
}

const ApplicationHistoryItemSchema = SchemaFactory.createForClass(
  ApplicationHistoryItem,
);

@Schema({
  collection: 'smart_bins',
  timestamps: true,
  versionKey: false,
  virtuals: true,
})
export class SmartBin extends Document {
  @Prop({
    type: SchemaTypes.ObjectId,
  })
  agentId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: SchemaTypes.String, required: false })
  binId?: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: false,
  })
  facilityId?: Types.ObjectId;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  payerId: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: false,
  })
  assignedTo?: Types.ObjectId;

  @Prop({
    type: String,
    required: false,
    enum: Object.values(BinAssignmentStatus),
    default: BinAssignmentStatus.Unassigned,
  })
  assignmentStatus?: BinAssignmentStatus;

  @Prop({
    type: String,
    enum: Object.values(BinType),
    default: BinType.Smart,
  })
  binType: BinType;

  @Prop({
    type: SchemaTypes.Number,
    required: false,
    default: 1,
  })
  quantity?: number;

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

  @Prop({
    type: SchemaTypes.Number,
    required: false,
    default: DEFAULT_SMART_BIN_AMOUNT,
  })
  amount?: number;

  @Prop({ type: SchemaTypes.String, required: false })
  branch?: string;

  @Prop({ type: SchemaTypes.String, required: false })
  branchId?: string;

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

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Lga.name,
    required: false,
  })
  lga_id?: Types.ObjectId;

  @Prop({ type: Date, required: false })
  deliveredOn?: Date;

  @Prop({ type: Date, required: false })
  approvalDate?: Date;

  @Prop({ type: SchemaTypes.String, required: false })
  deliveredBy?: string;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: [ApplicationHistoryItemSchema], default: [] })
  applicationHistory: ApplicationHistoryItem[];

  @Prop({ type: SchemaTypes.String })
  receiverName?: string;

  @Prop({
    type: String,
    enum: Object.values(RecieverType),
    default: RecieverType.OWNER,
  })
  receiverType?: RecieverType;
}

export const SmartBinSchema = SchemaFactory.createForClass(SmartBin);

SmartBinSchema.virtual('payment', {
  ref: Transaction.name,
  localField: 'transactionReference',
  foreignField: 'transactionReference',
  justOne: true,
  options: { select: 'status amount paymentMethod -_id' },
});
