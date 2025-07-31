import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from './types';

@Schema({ timestamps: true })
export class NotificationSettings extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true, enum: UserRole })
    userType: UserRole;

    @Prop({ default: true })
    sms: boolean;

    @Prop({ default: true })
    email: boolean;

    @Prop({ default: true })
    inApp: boolean;

    @Prop({ default: true })
    appUpdates: boolean;

    @Prop({ default: true })
    smartBinUpdates: boolean;

    @Prop({ default: true })
    lowWalletBalance: boolean;
}

export const NotificationSettingsSchema = SchemaFactory.createForClass(NotificationSettings);
