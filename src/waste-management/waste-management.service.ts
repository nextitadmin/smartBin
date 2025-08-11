import { AuthUser } from '@common/types';
import { Injectable } from '@nestjs/common';
import { CreatePickupDto } from '@src/waste-management/pickup/dto/createPickup.dto';
import { PickupService } from '@src/waste-management/pickup/pickup.service';
import { RequestPickupDto } from './pickup/dto/pickup.dto';

@Injectable()
export class WasteManagementService {
  constructor(private readonly pickupService: PickupService) {}

  async getWasteManagements() {}

  async getAllPickups(account: AuthUser) {
    return this.pickupService.getPickups(account);
  }

  async createPickup(user: AuthUser, param: CreatePickupDto) {
    console.log('Creating pickup for user:', user);
    return this.pickupService.createPickup({
      accountId: user.id,
      accountType: user.role,
      applicationData: { ...param },
    });
  }
}
