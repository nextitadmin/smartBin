import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ReportType {
    PaymentHistory = 'payment-history',
    WastePickup = 'waste-pickup',
    SmartBinRequest = 'smartbin-request',
}

export interface ReportAttributes {
    type: ReportType;
    reportName: string;
    filters: Record<string, any>;
    data: Record<string, any>;
    userId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}


@Schema({ timestamps: true })
export class Report implements ReportAttributes {
    @Prop({
        required: true,
        type: SchemaTypes.ObjectId,
    })
    userId: Types.ObjectId;

    @Prop()
    reportName: string;

    @Prop({
        type: String,
        enum: Object.values(ReportType),
        required: true,
    })
    type: ReportType;

    @Prop({ type: Object })
    filters: Record<string, any>;

    @Prop({ type: Object })
    data: Record<string, any>;

    createdAt?: Date;
    updatedAt?: Date;
}

export type ReportDocument = Report & Document;
export const ReportSchema = SchemaFactory.createForClass(Report);
