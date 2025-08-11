import {
  AuthenticatedCorporate,
  CorporateAuth,
} from '@common/decorators/auth.decorator';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PickupService } from '@src/waste-management/pickup/pickup.service';
import { WasteManagementService } from '@src/waste-management/waste-management.service';
import { PaginatedSuccessResponse, SuccessResponse } from '@common/http';
import { CorporateService } from '../corporate.service';
import { CorporateUser } from '@common/types';
import { CreatePickupDto } from '@src/waste-management/pickup/dto/createPickup.dto';

@ApiTags('Corporate/Waste Management')
@Controller({
  path: 'corporate/waste-management',
  version: '1',
})
@CorporateAuth()
export class WasteManagementController {
  constructor(
    private readonly wasteManagementService: WasteManagementService,
  ) {}

  @Get('pickups')
  async getAllPickups(@AuthenticatedCorporate() account: CorporateUser) {
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
    @AuthenticatedCorporate() account: CorporateUser,
  ) {
    const pickupRequest = await this.wasteManagementService.createPickup(
      account,
      body,
    );

    return new SuccessResponse('pickup created', pickupRequest);
  }
}
