import { SmartbinStatus } from '@models/smart-bin.model';
import { Injectable } from '@nestjs/common';
import { DeliveryData, GetApplicationsDto, GetDeliveredApplicationsDto, GetTeamMemberBinsFilterDto, scheduleDeliveryDto } from '@src/smart-bin/dto/binAppDto';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';

@Injectable()
export class LawmaSmartbinPartnersService {
  constructor(private readonly smartBinService: SmartBinService) {}

  async getSmartBinPartnersDashboard() {
    return this.smartBinService.getSmartBinPartnersDashboard();
  }
  async getSmartBinTeamMemberDashboard(partnerId: string) {
    return this.smartBinService.getsmartBinTeamMemberDashboard(partnerId);
  }

  async getAllOrders(filters:GetApplicationsDto){
    return this.smartBinService.getAllApplications(filters)
  }

  async getDeliveredBins(filters: GetDeliveredApplicationsDto){
    return this.smartBinService.getDeliveredSmartBins(filters)
  }
  async getOrderDetails(orderId:string){
    return this.smartBinService.getBinApplicationDetails(orderId)
  }

  async updateOrderStatus(orderId:string, status:SmartbinStatus){
    return this.smartBinService.updateStatus(orderId, status)
  }

  async scheduleDelivery(filters:scheduleDeliveryDto){
    return this.smartBinService.scheduleDelivery(filters)
  }

 
  async deliverBin(applicationId: string, deliveryData:DeliveryData){
    return this.smartBinService.deliverBin(applicationId,deliveryData)
  }

  async getTeamMemberDeliveredBins(teammemberId:string, filter:GetTeamMemberBinsFilterDto){
    return this.smartBinService.getTeamMemberDeliveredBins(teammemberId,filter)
  }


   async getTeamMemberActivatedBins(teammemberId:string, filter:GetTeamMemberBinsFilterDto){
    return this.smartBinService.getTeamMemberActivatedBins(teammemberId,filter)
  }
}
