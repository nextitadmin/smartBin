import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type TeamMemberDocument = TeamMember & Document;

@Schema({
    collection: 'team-members',
    timestamps: true,
    versionKey: false,
})
export class TeamMember {
    @Prop({
        required: true,
        type: SchemaTypes.ObjectId,
    })
    userId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop()
    branch?: string;

    @Prop()
    location?: string;




}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
