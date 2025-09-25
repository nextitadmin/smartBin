import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { LawmaWasteManagementService } from './waste-management.service';
import {
  AdminAuth,
  AuthenticatedAdmin,
} from '@common/decorators/auth.decorator';
import { AdminUser } from '@common/types';
import { Status } from '@models/pickup';
import { GetPickupDto } from '@src/waste-management/pickup/dto/pickup.dto';

@ApiTags('Admin/Waste Management')
@Controller({
  path: 'lawma/waste-management',
  version: '1',
})
@AdminAuth()
export class WasteManagementController {
  constructor(
    private readonly wasteManagementService: LawmaWasteManagementService,
  ) {}

  @Get('pickups')
  async getSuperAdminPickups(
    @AuthenticatedAdmin() admin: AdminUser,
    @Query() filters?: GetPickupDto,
  ) {
    return this.wasteManagementService.getPickupsForAdmin(admin, filters);
  }
}
