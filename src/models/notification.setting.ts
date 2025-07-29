// schemas/notification-settings.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from './types';

@Schema({ timestamps: true })
export class NotificationSettings extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true, enum: UserRole })
    userType: UserRole;

    @Prop()
    sms: boolean;

    @Prop()
    email: boolean;

    @Prop()
    inApp: boolean;

    @Prop()
    appUpdates: boolean;

    @Prop()
    smartBinUpdates: boolean;

    @Prop()
    lowWalletBalance: boolean;
}

export const NotificationSettingsSchema = SchemaFactory.createForClass(NotificationSettings);
