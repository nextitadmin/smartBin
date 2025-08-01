import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BillStatus {
  Pending = 'pending',
  Completed = 'completed',
}

export enum PaymentMethod {
  Wallet = 'Wallet',
  AlatByWema = 'Alat By Wema',
}

export interface BillAttributes {
  userId: Types.ObjectId;
  billId: string;
  service: string;
  amount: number;
  dueDate: Date;
  status?: BillStatus;
  paidAt?: Date;
  paymentMethod?: PaymentMethod;
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({ timestamps: true })
export class Bill implements BillAttributes {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  billId: string;

  @Prop({ required: true })
  service: string;

  @Prop()
  customerName: string;

  @Prop()
  branch: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({
    type: String,
    enum: Object.values(BillStatus),
    default: BillStatus.Pending,
  })
  status?: BillStatus;

  @Prop()
  paidAt?: Date;

  @Prop({ type: String, enum: Object.values(PaymentMethod) })
  paymentMethod?: PaymentMethod;

  createdAt?: Date;
  updatedAt?: Date;
}

export type BillDocument = Bill & Document;
export const BillSchema = SchemaFactory.createForClass(Bill);

BillSchema.pre<BillDocument>('find', function (next) {
  const obj = this as any;
  if (obj.userId) {
    obj.userId = new Types.ObjectId(obj.userId);
  }
  next();
});
