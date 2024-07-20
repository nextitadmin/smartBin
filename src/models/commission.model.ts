import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

// export type Commission = Commission & Document;
@Schema({
  collection: 'commissions',
  timestamps: true,
  versionKey: false,
})
export class Commission {
  @Prop({ required: true, index: true, unique: true })
  transactionReference: string;

  @Prop({ type: SchemaTypes.Number, required: true })
  amount: number;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);
