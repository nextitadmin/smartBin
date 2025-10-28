import { SmartbinStatus } from '@models/smart-bin.model';
import { Injectable } from '@nestjs/common';
import { orderBinsDto, scheduleDeliveryDto } from '@src/smart-bin/dto/binAppDto';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';

@Injectable()
export class LawmaSmartbinsService {
  constructor(private readonly smartBinService: SmartBinService) {}

  async getSmartBinOverview() {
    return this.smartBinService.getSmartBinOverview();
  }

  async getAdminSmartbinOverview() {
    return this.smartBinService.getAdminSmartbinOverview();
  }

  
  async getAllApplications(page: number, limit: number) {
    return this.smartBinService.getAllApplications(page, limit);
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

  async getDeliveredSmartBins(page: number, limit: number) {
    return this.smartBinService.getDeliveredSmartBins(page, limit);
  }
  
  async getAllBinOrders(filters?: orderBinsDto) {
    return this.smartBinService.getAllBinOrders(filters);
  }

  async scheduleDelivery(filters: scheduleDeliveryDto) {
    return this.smartBinService.scheduleDelivery(filters);
  }
}
