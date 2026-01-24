import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { LawmaSmartbinsService } from './smartbins.service';
import { AdminAuth } from '@common/decorators/auth.decorator';
import {  orderBinsDto, GetOverviewDto, } from '@src/smart-bin/dto/binAppDto';


@ApiTags('Admin/Smartbin Applications')
@Controller({
  path: 'lawma/smartbins',
  version: '1',
})
@AdminAuth()
export class SmartbinsController {
  constructor(private readonly smartbinService: LawmaSmartbinsService) {}

  @Get('superadmin/overview')
  getOverview(@Query() filters: GetOverviewDto) {
    return this.smartbinService.getSmartBinOverview(filters);
  }

  @Get('lawma-admin/overview')
  getLawmaAdminOverview(@Query() filters: GetOverviewDto) {
    return this.smartbinService.getAdminSmartbinOverview(filters);
  }


  @Get('application-details')
  @ApiQuery({ name: 'applicationId', type: String, required: true })
  getApplicationDetails(@Query('applicationId') applicationId: string) {
    return this.smartbinService.getBinApplicationDetails(applicationId);
  }



  @Get('orders')
  getAllBinOrders(
    @Query() filters?: orderBinsDto,
  ) {
    return this.smartbinService.getAllBinOrders(filters);
  }


  @Get(':orderId/tracker')
  async getOrderTimeline(@Param('orderId') orderId: string) {
    return this.smartbinService.getOrderTimeline(orderId);
  }


  @Delete(':orderId')
  async deleteApplication(@Param('orderId') orderId:string){
    return this.smartbinService.deleteApplication(orderId)
  }
}
