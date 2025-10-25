import { Controller } from '@nestjs/common';
import { LawmaPartnerService } from './lawma-partner.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Lawma Partner')
@Controller()
export class LawmaPartnerController {
  constructor(private readonly lawmaPartnerService: LawmaPartnerService) {}
}
