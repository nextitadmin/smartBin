import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

export enum NotificationType {
  LowWalletBalance = 'low_wallet_balance',
  PickupUpdate = 'pickup-update',
  SmartBinUpdate = 'smartbin-application',
  WalletUpdate = 'wallet-update',
  SystemUpdate = 'system-update',
}

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, versionKey: false })
export class Notification {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  title: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  text: string;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(NotificationType),
    required: true,
  })
  type: NotificationType;

  @Prop({
    type: SchemaTypes.Boolean,
    default: false,
  })
  isRead: boolean;

  @Prop({
    type: SchemaTypes.Mixed,
    default: {},
  })
  metadata: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
