import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { P } from 'pino';

export const DefaultSubscriptionPlan = [
  {
    name: '1 Month',
    price: 500000, // in kobo
    duration: 1,
    interval: 'month',
  },
  {
    name: '3 Month',
    price: 1200000, // in kobo
    duration: 3,
    interval: 'month',
  },
  {
    name: '6 Month',
    price: 2000000, // in kobo
    duration: 6,
    interval: 'month',
  },
  {
    name: '1 Year',
    price: 5500000, // in kobo
    duration: 1,
    interval: 'year',
  },
];

@Schema({
  timestamps: true,
  collection: 'subscription-plans',
  versionKey: false,
})
export class SubscriptionPlan {
  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  name: string;

  @Prop({
    type: SchemaTypes.Number,
    required: true,
  })
  price: number;

  @Prop({
    type: SchemaTypes.Number,
    required: true,
  })
  duration: number;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  interval: string;
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);
