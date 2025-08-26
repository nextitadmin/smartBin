import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum LawmaCustomerType {
  Returning = 'Returning',
  New = 'New',
}

export interface BranchAttributes {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  branchName: string;
  branchAddress: string;
  localGovernmentArea: string;
  lawmaCustomerType?: LawmaCustomerType;
  closestLandmark: string;
  state?: string;
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
    required: false,
    type: SchemaTypes.String,
  })
  state: string;

  @Prop({
    type: String,
    enum: Object.values(LawmaCustomerType),
    default: LawmaCustomerType.Returning,
  })
  lawmaCustomerType?: LawmaCustomerType;
}
export const BranchSchema = SchemaFactory.createForClass(Branch);

BranchSchema.pre('find', function () {
  const obj = this as any;
  obj.userId = new Types.ObjectId(obj.userId);
});

BranchSchema.pre('findOne', function () {
  const obj = this as any;
  obj.userId = new Types.ObjectId(obj.userId);
});
