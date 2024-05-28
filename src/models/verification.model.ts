import { SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface VerificationAttributes {
  identifier: string;
  data: any;
}

@Schema({
  collection: 'verifications',
  timestamps: true,
  versionKey: false,
})
export class Verification implements VerificationAttributes {
  @Prop({
    required: false,
    type: SchemaTypes.String,
  })
  identifier: string;

  @Prop({
    required: false,
    type: SchemaTypes.Mixed,
  })
  data: any;
}
export const VerificationSchema = SchemaFactory.createForClass(Verification);
