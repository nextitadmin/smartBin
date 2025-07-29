import { Injectable } from '@nestjs/common';
import {
  BUSINESS_SECTORS,
  LAGOS_LGAS,
  NIGERIAN_STATES,
} from './utility.constants';

@Injectable()
export class UtilityService {
  getStates(): string[] {
    return NIGERIAN_STATES;
  }

  getLgas(): string[] {
    return LAGOS_LGAS;
  }

  getBusinessSectors(): string[] {
    return BUSINESS_SECTORS;
  }
}
