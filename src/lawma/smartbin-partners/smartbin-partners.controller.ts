import { Controller, Get, Param, Patch, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LawmaSmartbinPartnersService } from './smartbin-partners.service';
import { AdminAuth } from '@common/decorators/auth.decorator';

@ApiTags('Admin/Smartbin Partners')
@Controller({
  path: 'lawma/smartbin-partners',
  version: '1',
})
// @AdminAuth()
export class SmartbinPartnersController {
  constructor(private readonly smartbinPartnersService: LawmaSmartbinPartnersService) {}

  @Get('dashboard')
  getDashboard() {
    return this.smartbinPartnersService.getSmartBinPartnersDashboard();
  }
  @Get('team-member/:partnerId')
  getTeamMemberDashboard(@Param('partnerId') partnerId: string) {
    return this.smartbinPartnersService.getSmartBinTeamMemberDashboard(partnerId);
  }

}
