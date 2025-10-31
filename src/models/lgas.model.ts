import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type LgaDocument = Lga & Document;
export interface LGAAttributes {
  name: string;
  state: string;
}
@Schema({
  collection: 'lgas',
  timestamps: false,
  versionKey: false,
})
export class Lga {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: 'Lagos' })
  state: string;
}

export const LgaSchema = SchemaFactory.createForClass(Lga);
