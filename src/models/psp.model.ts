import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

export type PspDocument = PSP & Document;

@Schema({ collection: 'psps', timestamps: true, versionKey: false })
export class PSP {
  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  company_name: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  administrator_name: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  administrator_phone: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  lga_address: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  company_address: string;

  @Prop({
    type: SchemaTypes.Date,
    required: false,
  })
  deleted_at: Date;
}

export const PSPSchema = SchemaFactory.createForClass(PSP);
