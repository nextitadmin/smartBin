import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type FacilityDocument = Facility & Document;

@Schema({
    collection: 'facilities',
    timestamps: true,
    versionKey: false,
})
export class Facility {
    @Prop({
        required: true,
        type: SchemaTypes.ObjectId,
    })
    userId: Types.ObjectId;

    @Prop({ required: true })
    buildingName: string;

    @Prop({ required: true })
    buildingType: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    localGovernment: string;

    @Prop({ required: true })
    closestLandmark: string;


}

export const FacilitySchema = SchemaFactory.createForClass(Facility);
