import {
  defaultAirtimeProviders,
  defaultDataProviders,
} from '@common/constants';
import { Injectable } from '@nestjs/common';
import { VTPassService } from '@src/providers/vtpass.service';

export type AirtimeDataQueryType = 'airtime' | 'data';
@Injectable()
export class AirtimeDataService {
  constructor(private readonly vtpassService: VTPassService) {}

  async getAirtimeDataProviders(type: AirtimeDataQueryType) {
    if (type === 'data') {
      return defaultDataProviders;
    }

    return defaultAirtimeProviders;
  }

  async getProviderDataPlans(providerId) {
    // return await this.vtpassService;
  }
}
