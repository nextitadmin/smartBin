import {
  Controller,
  Get,
  Query,
  Param,
  Body,
  Post,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LawmaWasteManagementService } from './waste-management.service';
import {
  PspUserAuth,
  AuthenticatedPspUser,
} from '@common/decorators/auth.decorator';
import { PspUser } from '@common/types';
import { Status } from '@models/pickup';
import {
  GetPickupDto,
  AssignTeamMemberDto,
  UpdatePickupStatusDto,
} from '@src/waste-management/pickup/dto/pickup.dto';

@ApiTags('PSP/Waste Management')
@Controller({
  path: 'psp/waste-management',
  version: '1',
})
@PspUserAuth()
export class PspWasteManagementController {
  constructor(
    private readonly wasteManagementService: LawmaWasteManagementService,
  ) {}

  @Get('pickups/pending')
  async getPickupRequests(
    @AuthenticatedPspUser() psp: PspUser,
    @Query() filters?: GetPickupDto,
  ) {
    return this.wasteManagementService.getPickupRequest(psp, filters);
  }

  @Get('pickups/:id')
  async getPickupById(@Param('id') id: string) {
    return this.wasteManagementService.getPickupById(id);
  }

  @Get('completed')
  async getCompletedPickups(
    @AuthenticatedPspUser() psp: PspUser,
    @Query() filters?: GetPickupDto,
  ) {
    return this.wasteManagementService.getCompletedPickups(psp, filters);
  }

  @Patch('pickups/:id/assign-team-member')
  async assignTeamMember(
    @AuthenticatedPspUser() psp: PspUser,
    @Param('id') id: string,
    @Body() dto: AssignTeamMemberDto,
  ) {
    return this.wasteManagementService.assignTeamMember(psp, id, dto);
  }

  @Get('assigned-pickups')
  async getAssignedPickups(
    @AuthenticatedPspUser() psp: PspUser,
    @Query() filters?: GetPickupDto,
  ) {
    return this.wasteManagementService.getAssignedPickups(psp, filters);
  }
}
