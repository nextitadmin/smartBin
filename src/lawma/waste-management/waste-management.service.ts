import { Status } from '@models/pickup';
import { Injectable } from '@nestjs/common';
import { PickupService } from '@src/waste-management/pickup/pickup.service';

@Injectable()
export class LawmaWasteManagementService {
  constructor(private readonly pickupService: PickupService) {}
  async getPickupsForSuperAdmin(admin: string, status: Status) {
    return this.pickupService.getPickupsForSuperAdmin(admin, status);
  }
}
