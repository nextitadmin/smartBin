import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import {
  PspUserPermissions,
  SmartBinUserPermissions,
} from './permission.model';

export interface RoleAttributes {
  name: string;
  permissions: Record<
    keyof typeof SmartBinUserPermissions | keyof typeof PspUserPermissions,
    string[]
  >;
}

export type TRole = RoleAttributes & Document;

@Schema({
  collection: 'roles',
  timestamps: true,
  versionKey: false,
})
export class Role extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: SchemaTypes.Mixed })
  permissions: Record<
    keyof typeof SmartBinUserPermissions | keyof typeof PspUserPermissions,
    string[]
  >;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  createdBy: Types.ObjectId;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.pre('find', function (next) {
  const obj: any = this;
  obj.createdBy = new Types.ObjectId(obj.createdBy);
  next();
});
