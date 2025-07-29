import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface BranchAttributes {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  branchName: string;
  branchAddress: string;
  localGovernmentArea: string;
  closestLandmark: string;
  state: string;
}

@Schema({
  collection: 'corporate_branches',
  timestamps: true,
  versionKey: false,
})
export class Branch implements BranchAttributes {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
  })
  userId: Types.ObjectId;
  @Prop({
    required: true,
    type: SchemaTypes.String,
  })
  branchName: string;

  @Prop({
    required: true,
    type: SchemaTypes.String,
  })
  branchAddress: string;

  @Prop({
    required: true,
    type: SchemaTypes.String,
  })
  localGovernmentArea: string;

  @Prop({
    required: true,
    type: SchemaTypes.String,
  })
  closestLandmark: string;

  @Prop({
    required: true,
    type: SchemaTypes.String,
  })
  state: string;
}
export const BranchSchema = SchemaFactory.createForClass(Branch);
