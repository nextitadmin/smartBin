import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export enum LOGTYPE {
  UserLoggedIn = 'User Logged In',
  PasswordChanged = 'Password Changed',
  PspAdded = 'Psp Added',
  PspActivated = 'Psp Activated',
  PspDeactivated = 'Psp Deactivated',
  PspTeamMemberAdded = 'Team Member Added',
  PspTeamMemberRemoved = 'Team Member Removed',
  StatusChanged = 'Status Changed',
}

export enum UserType {
  Admin = 'admin',
  PSP = 'psp'
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

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(UserType),
  })
  userType: UserType;

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
