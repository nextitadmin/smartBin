import { Controller } from '@nestjs/common';
import { FacilityManagerService } from './facility-manager.service';

@Controller('facility-manager')
export class FacilityManagerController {
  constructor(private readonly facilityManagerService: FacilityManagerService) {}
}
