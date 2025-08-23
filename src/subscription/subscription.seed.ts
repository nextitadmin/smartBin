import {
  DefaultSubscriptionPlan,
  SubscriptionPlan,
} from '@models/subscription-plan.model';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SubscribePlanSeed {
  private logger = new Logger(SubscribePlanSeed.name);
  constructor(
    @InjectModel(SubscriptionPlan.name)
    private readonly subscriptionPlan: Model<SubscriptionPlan>,
  ) {
    this.seed();
  }

  async seed() {
    const subscriptionPlans = await this.subscriptionPlan.find();
    if (subscriptionPlans.length > 0) return;

    await this.subscriptionPlan.deleteMany({});
    await this.subscriptionPlan.insertMany(DefaultSubscriptionPlan);
    this.logger.log('Subscription plans seeded successfully.');
  }
}
