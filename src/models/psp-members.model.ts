import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

export enum PSPMembersStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export type PspMembersDocument = PSPMembers & Document;

@Schema({ collection: 'psp-members', timestamps: true, versionKey: false })
export class PSPMembers {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
  })
  psp_id: Types.ObjectId;

  @Prop({
    type: SchemaTypes.Mixed,
    required: true,
  })
  psp_details: Record<string, any>;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  name: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  email: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  phone_number: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
    enum: Object.values(PSPMembersStatus),
    default: PSPMembersStatus.ACTIVE,
  })
  status: PSPMembersStatus;
}

export const PSPMembersSchema = SchemaFactory.createForClass(PSPMembers);
