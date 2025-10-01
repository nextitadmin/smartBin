import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export enum LOGTYPE {
  USER_LOGIN = 'user_login',
  CHANGE_PASSWORD = 'change_password',
  ADD_PSP = 'add_psp',
  DEACTIVATE_PSP = 'deactivate_psp',
  ADD_TEAM_MEMBER = 'add_team_member',
  REMOVE_TEAM_MEMBER = 'remove_team_member',
  STATUS_CHANGE = 'change_status',
}

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Administrator', required: true })
  user: Types.ObjectId;

  @Prop({ type: SchemaTypes.String, required: true })
  name: string;

  @Prop({ type: SchemaTypes.String, required: true })
  email: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
    enum: Object.values(LOGTYPE),
  })
  action: LOGTYPE;

  @Prop({ type: SchemaTypes.String, required: true })
  platform?: string;

  @Prop({ type: SchemaTypes.String, required: true })
  ipAddress?: string;

  @Prop({ type: SchemaTypes.Date, default: Date.now })
  timestamp: Date;
}

export type AuditLogDocument = AuditLog & Document;
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.pre<AuditLogDocument>('find', function (next) {
  const obj = this as any;
  if (obj.user) {
    obj.user = new Types.ObjectId(obj.user);
  }
  next();
});
