import { Injectable } from '@nestjs/common';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';

@Injectable()
export class LawmaSmartbinsService {
  constructor(private readonly smartBinService: SmartBinService) {}

  async getSmartBinOverview() {
    return this.smartBinService.getSmartBinOverview();
  }

  async getAllApplications(page: number, limit: number) {
    return this.smartBinService.getAllApplications(page, limit);
  }

  async getBinApplicationDetails(applicationId: string) {
    return this.smartBinService.getBinApplicationDetails(applicationId);
  }

  async getDeliveredSmartBins(page: number, limit: number) {
    return this.smartBinService.getDeliveredSmartBins(page, limit);
  }
  
  async getAllBinOrders(page: number, limit: number) {
    return this.smartBinService.getAllBinOrders(page, limit);
  }

  async scheduleDelivery(
    applicationId: string,
    teamMemberId: string,
    comment: string,
  ) {
    return this.smartBinService.scheduleDelivery(
      applicationId,
      teamMemberId,
      comment,
    );
  }
}
