import { Controller } from '@nestjs/common';
import { CorporateService } from './corporate.service';

@Controller('corporate')
export class CorporateController {
  constructor(private readonly corporateService: CorporateService) {}
}
