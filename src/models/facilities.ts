import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Lga } from './lgas.model';

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

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Lga.name,
    required: true,
  })
  lgaId: Types.ObjectId;

  @Prop({ required: true })
  closestLandmark: string;
}

export const FacilitySchema = SchemaFactory.createForClass(Facility);
