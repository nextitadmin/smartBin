import { Injectable } from '@nestjs/common';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';

@Injectable()
export class LawmaSmartbinPartnersService {
  constructor(private readonly smartBinService: SmartBinService) {}

  async getSmartBinPartnersDashboard() {
    return this.smartBinService.getSmartBinPartnersDashboard();
  }
}
