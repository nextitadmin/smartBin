import { Injectable } from '@nestjs/common';
import { CreatePickupDto } from '@src/pickup/dto/createPickup.dto';
import { PickupService } from '@src/pickup/pickup.service';

@Injectable()
export class WasteManagementService {
  constructor(private readonly pickupService: PickupService) {}

  async getWasteManagements() {}

  async getAllPickups(accountId: string) {
    return this.pickupService.getCorporatePickups(accountId);
  }

  async createPickup(data: CreatePickupDto) {
    return this.pickupService.createPickup(data);
  }
}
