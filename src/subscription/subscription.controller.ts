import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { SuccessResponse } from '@common/http';
import { Auth, AuthenticatedUser } from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { SubscribePlanDTO } from './dto/subscription.dto';

@ApiTags('Subscription')
@Controller({
  path: 'subscription',
  version: '1',
})
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  async getPlans() {
    const plans = await this.subscriptionService.getPlans();
    return new SuccessResponse(
      'Subscription plans retrieved successfully',
      plans,
    );
  }

  @Get('status')
  async getStatus(@AuthenticatedUser() user: AuthUser) {
    const subscriptionStatus = await this.subscriptionService.getStatus(user);
    return new SuccessResponse(
      'Subscription status retrieved successfully',
      subscriptionStatus,
    );
  }

  @Post('subscribe')
  @Auth()
  async subscribe(
    @AuthenticatedUser() user: AuthUser,
    @Body() body: SubscribePlanDTO,
  ) {
    const subscription = await this.subscriptionService.subscribe({
      user,
      dto: body,
    });
    return new SuccessResponse(
      'Subscription created successfully',
      subscription,
    );
  }
}
