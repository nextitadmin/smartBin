import { Controller, Get, Query,Param,Body,Post,Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LawmaWasteManagementService } from './waste-management.service';
import { PspTeamMemberAuth, AuthenticatedPspTeamMember} from '@common/decorators/auth.decorator';
import { PspAdminUser } from '@common/types';
import { Status } from '@models/pickup';
import { GetPickupDto,UpdatePickupStatusDto } from '@src/waste-management/pickup/dto/pickup.dto';
import { PspTeamMember } from '@common/types';

@ApiTags('PSP-Team/Waste Management')
@Controller({
  path: 'psps/team/waste-management',
  version: '1',
})
@PspTeamMemberAuth()
export class PspTeamWasteManagementController {
  constructor(
    private readonly wasteManagementService: LawmaWasteManagementService,
  ) {}

  @Get('pickups/assigned')
  async getAssignedPickups(
    @AuthenticatedPspTeamMember() pspTeamMember: PspTeamMember,
    @Query() filters?: GetPickupDto,
  ) {
    return this.wasteManagementService.getTeammemberAssignedPickup(pspTeamMember, filters);
  }

  @Get('pickups/:id')
  async getPickupById(@Param('id') id: string) {
    return this.wasteManagementService.getPickupById(id);
  }

   @Patch('pickups/:id/status')
     async updateStatus(
       @Param('id') id: string,
       @Query() dto: UpdatePickupStatusDto,
     ) {
       return this.wasteManagementService.updatePickupStatus(id, dto);
     }

    
}
