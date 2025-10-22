import { SuccessResponse } from '@common/http';
import { Status } from '@models/pickup';
import { Injectable } from '@nestjs/common';
import { PickupService } from '@src/waste-management/pickup/pickup.service';
import { AdminUser,PspAdminUser, PspTeamMember } from '@common/types';
import { GetPickupDto ,AssignTeamMemberDto, UpdatePickupStatusDto} from '@src/waste-management/pickup/dto/pickup.dto';

@Injectable()
export class LawmaWasteManagementService {
  constructor(private readonly pickupService: PickupService) {}
  async getPickupsForAdmin(
    admin: AdminUser,
    filters?: GetPickupDto,
    
  ) {
    const data = await this.pickupService.getPickupsForAdmin(
      admin,
      filters,
    );
    return new SuccessResponse('Pickups retrieved successfully', data);
  }



  async getPickupRequest(psp:PspAdminUser, filters?: GetPickupDto) {
    const pendingPickups = await this.pickupService.getPendingPickups(psp,filters);
    return new SuccessResponse('Pickup requests retrieved successfully', pendingPickups);
  }

  async getPickupById(id: string) {
    const pickup = await this.pickupService.getPickupByWasteId(id);
    return new SuccessResponse('Pickup retrieved successfully', pickup);
  }
  async getCompletedPickups (psp:PspAdminUser,filters?:GetPickupDto){
    const completedPickups = await this.pickupService.getCompletedPickups(psp,filters)
    return new SuccessResponse ('Completed Pickups retrieved successfully', completedPickups)
  }
  
  async updatePickupStatus(
    id: string,
    dto: UpdatePickupStatusDto,
  ) {
    const updatedPickup = await this.pickupService.updatePickupStatus(  id,dto);
    return new SuccessResponse('Pickup status updated successfully', updatedPickup);
  }

  async assignTeamMember(
    psp:PspAdminUser,
    id: string,
    dto:AssignTeamMemberDto,
  ) {
    const updatedPickup = await this.pickupService.assignTeamMember(
      psp,
      id,
    dto
    );
    return new SuccessResponse('Team member assigned successfully', updatedPickup);
  }

  async getAssignedPickups(psp:PspAdminUser, filters?: GetPickupDto) {
    const assignedPickups = await this.pickupService.getAssignedPickups(psp,filters);
    return new SuccessResponse('Assigned pickups retrieved successfully', assignedPickups);
  }

  async getTeammemberAssignedPickup(pspTeamMember:PspTeamMember, filters?: GetPickupDto) {
    const assignedPickups = await this.pickupService.getPickupAssignedToTeammember(pspTeamMember,filters);
    return new SuccessResponse('Assigned pickups retrieved successfully', assignedPickups);
  }

}
