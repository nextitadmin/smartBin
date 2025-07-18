import { Controller } from '@nestjs/common';
import { ResidentService } from './resident.service';

@Controller('resident')
export class ResidentController {
  constructor(private readonly residentService: ResidentService) {}
}
