import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export enum LawmaCustomerType {
  Returning = 'Returning',
  New = 'New',
}

export enum BinType {
  Smart = 'smart',
  Non_Smart = 'non_smart',
}

export enum BinAssignmentStatus {
  Assigned = 'assigned',
  Unassigned = 'unassigned',
}


export type FacilityDocument = FacilityUsers & Document;

@Schema({
  collection: 'facility-users',
  timestamps: true,
  versionKey: false,
})
export class FacilityUsers {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
  })
  accountId: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: false })
  houseNumber: string;

  @Prop({ required: false })
  flatNumber: string;

  @Prop({ required: true })
  buildingName: string;

  @Prop({ required: false })
  buildingType: string;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  localGovernment: string;

   @Prop({ required: false })
  binStatus: string;

  @Prop({ required: false })
  closestLandmark: string;

  @Prop({ required: false })
  dateAdded: Date;

  @Prop({ required: false })
  deativationDate: Date;

  @Prop({
    type: String,
    enum: Object.values(LawmaCustomerType),
    default: LawmaCustomerType.Returning,
  })
  lawmaCustomerType?: LawmaCustomerType;

  @Prop({
    type: String,
    enum: Object.values(BinType),
    default: BinType.Smart,
  })
  binType: BinType;
}

export const FacilityUserSchema = SchemaFactory.createForClass(FacilityUsers);
