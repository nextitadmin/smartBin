import { SuccessResponse } from '@common/http';
import { Status } from '@models/pickup';
import { Injectable } from '@nestjs/common';
import { PickupService } from '@src/waste-management/pickup/pickup.service';
import { AdminUser } from '@common/types';
import { GetPickupDto } from '@src/waste-management/pickup/dto/pickup.dto';

@Injectable()
export class LawmaWasteManagementService {
  constructor(private readonly pickupService: PickupService) {}
  async getPickupsForAdmin(admin: AdminUser, page?: number, limit?: number) {
    const data = await this.pickupService.getPickupsForAdmin(admin,page,limit);
    return new SuccessResponse('Pickups retrieved successfully', data);
  }
}
