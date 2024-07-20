import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type WebhookRequestDocument = WebhookRequest & Document;

@Schema()
export class WebhookRequest {
  @Prop({ required: true })
  requestedUrl: string;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  data: any;
}

export const WebhookRequestSchema =
  SchemaFactory.createForClass(WebhookRequest);
