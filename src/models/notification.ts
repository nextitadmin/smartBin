import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';


export enum NotificationType {
    LowWalletBalance = 'low_wallet_balance',
    Pickup = 'pickup',
    SmartBinUpdate = 'smartbin',
    SystemUpdate = 'system',
}

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, collection: 'notifications' })

export class Notification {
    @Prop({ type: SchemaTypes.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop()
    title: string;

    @Prop()
    text: string;

    @Prop({ required: true })
    type: NotificationType;

    @Prop({ type: Object, default: {} })
    meta?: Record<string, any>;

    @Prop({ default: false })
    isRead?: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
