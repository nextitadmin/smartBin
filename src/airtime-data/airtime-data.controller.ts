import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  AirtimeDataQueryType,
  AirtimeDataService,
} from './airtime-data.service';
import { CustomerAuth } from '@common/decorators/auth.decorator';
import { SuccessResponse } from '@common/http';
import { BodySchema } from '@common/joi';

@Controller({ path: 'airtime-data', version: '1' })
export class AirtimeDataController {
  constructor(private readonly airtimeDataService: AirtimeDataService) {}

  @Get()
  @CustomerAuth()
  async getAirtimeProviders(@Query() query: { type: AirtimeDataQueryType }) {
    const providers = await this.airtimeDataService.getAirtimeDataProviders(
      query.type,
    );

    return new SuccessResponse(`${query.type} providers fetched`, providers);
  }

  @Get('/:providerId/plans')
  @CustomerAuth()
  async getAirtimeProviderPlans(@Param() param: { providerId: string }) {
    const providers = await this.airtimeDataService.getProviderDataPlans(
      param.providerId,
    );

    return new SuccessResponse(
      `${param.providerId} providers fetched`,
      providers,
    );
  }

  // @Post()
  // @CustomerAuth()
  // @BodySchema()
  // async purchaseAirtimeOrData() {}
}
