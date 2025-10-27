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
  AuthenticatedPspAdmin,
} from '@common/decorators/auth.decorator';
import { PspAdminUser } from '@common/types';
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
    @AuthenticatedPspAdmin() psp: PspAdminUser,
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
    @AuthenticatedPspAdmin() psp: PspAdminUser,
    @Query() filters?: GetPickupDto,
  ) {
    return this.wasteManagementService.getCompletedPickups(psp, filters);
  }

  @Patch('pickups/:id/assign-team-member')
  async assignTeamMember(
    @AuthenticatedPspAdmin() psp: PspAdminUser,
    @Param('id') id: string,
    @Body() dto: AssignTeamMemberDto,
  ) {
    return this.wasteManagementService.assignTeamMember(psp, id, dto);
  }

  @Get('assigned-pickups')
  async getAssignedPickups(
    @AuthenticatedPspAdmin() psp: PspAdminUser,
    @Query() filters?: GetPickupDto,
  ) {
    return this.wasteManagementService.getAssignedPickups(psp, filters);
  }
}
