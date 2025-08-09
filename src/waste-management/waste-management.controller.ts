import { Body, Controller, Get, Post } from '@nestjs/common';
import { WasteManagementService } from './waste-management.service';
import { Auth, AuthenticatedUser } from '@common/decorators/auth.decorator';
import { AuthUser } from '@common/types';
import { PaginatedSuccessResponse, SuccessResponse } from '@common/http';
import { CreatePickupDto } from '@src/waste-management/pickup/dto/createPickup.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequestPickupDto } from './pickup/dto/pickup.dto';

@ApiTags('Waste Managements')
@Controller({
  path: 'waste-management',
  version: '1',
})
@Auth()
export class WasteManagementController {
  constructor(
    private readonly wasteManagementService: WasteManagementService,
  ) {}

  @Get('pickups')
  async getAllPickups(@AuthenticatedUser() account: AuthUser) {
    const pickups = await this.wasteManagementService.getAllPickups(account);
    return new PaginatedSuccessResponse(
      'pickups fetched',
      pickups.data,
      pickups.paging,
    );
  }

  @Post('pickups')
  async createPickup(
    @Body() body: CreatePickupDto,
    @AuthenticatedUser() account: AuthUser,
  ) {
    const pickupRequest = await this.wasteManagementService.createPickup(
      account,
      body,
    );

    return new SuccessResponse('pickup created', pickupRequest);
  }
}
