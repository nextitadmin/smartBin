import { BinType, SmartbinStatus } from '@models/smart-bin.model';
import { Injectable } from '@nestjs/common';
import {
  GetApplicationsDto,
  orderBinsDto,
  scheduleDeliveryDto,
} from '@src/smart-bin/dto/binAppDto';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';

@Injectable()
export class LawmaSmartbinsService {
  constructor(private readonly smartBinService: SmartBinService) {}

  async getSmartBinOverview(filters?: { year?: number; binType?: BinType }) {
    return this.smartBinService.getSmartBinOverview(filters);
  }

  async getAdminSmartbinOverview(filters?: { year?: number; binType?: BinType }) {
    return this.smartBinService.getAdminSmartbinOverview(filters);
  }

  
  async getAllApplications(filters:GetApplicationsDto) {
    return this.smartBinService.getAllApplications(filters);
  }

  async getBinApplicationDetails(applicationId: string) {
    return this.smartBinService.getBinApplicationDetails(applicationId);
  }

  async updateBinApplicationStatus(orderId: string, newStatus: SmartbinStatus){
    return this.smartBinService.updateStatus(orderId, newStatus);
  }
  async getOrderTimeline(orderId: string) {
    return this.smartBinService.getOrderTimeline(orderId);
  }

  async getDeliveredSmartBins(filters:GetApplicationsDto) {
    return this.smartBinService.getDeliveredSmartBins(filters);
  }
  
  async getAllBinOrders(filters?: orderBinsDto) {
    return this.smartBinService.getAllBinOrders(filters);
  }

  async scheduleDelivery(filters: scheduleDeliveryDto) {
    return this.smartBinService.scheduleDelivery(filters);
  }
}
