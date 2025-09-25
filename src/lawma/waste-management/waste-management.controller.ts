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

  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: Status, required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get('pickups')
  async getSuperAdminPickups(
    @AuthenticatedAdmin() admin: AdminUser,
    @Query() filters?: GetPickupDto,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.wasteManagementService.getPickupsForAdmin(
      admin,
      page,
      limit,
      filters
    );
  }
}
