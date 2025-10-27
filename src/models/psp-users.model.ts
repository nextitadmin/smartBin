import { getHashedPassword } from '@common/utils';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

export enum PSPUsersStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export type PspUsersDocument = PSPUsers & Document;

@Schema({ collection: 'psp-users', timestamps: true, versionKey: false })
export class PSPUsers {
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

  @Prop({ required: true })
  password: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  phone_number: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
    enum: Object.values(PSPUsersStatus),
    default: PSPUsersStatus.ACTIVE,
  })
  status: PSPUsersStatus;
}

export const PSPUsersSchema = SchemaFactory.createForClass(PSPUsers);

PSPUsersSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = getHashedPassword(this.password);
  }
  next();
});
