import { Controller, Get, Param, Patch, Put, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { LawmaSmartbinsService } from './smartbins.service';
import { AdminAuth } from '@common/decorators/auth.decorator';
import { orderBinsDto } from '@src/smart-bin/dto/binAppDto';
import { SmartbinStatus } from '@models/smart-bin.model';
import { SuccessResponse } from '@common/http';

@ApiTags('Admin/Smartbin Applications')
@Controller({
  path: 'lawma/smartbins',
  version: '1',
})
@AdminAuth()
export class SmartbinsController {
  constructor(private readonly smartbinService: LawmaSmartbinsService) {}

  @Get('superadmin/overview')
  getOverview() {
    return this.smartbinService.getSmartBinOverview();
  }

  @Get('lawma-admin/overview')
  getLawmaAdminOverview() {
    return this.smartbinService.getAdminSmartbinOverview();
  }



  @Get()
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  getApplications(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.smartbinService.getAllApplications(Number(page), Number(limit));
  }

  @Get('application-details')
  @ApiQuery({ name: 'applicationId', type: String, required: true })
  getApplicationDetails(@Query('applicationId') applicationId: string) {
    return this.smartbinService.getBinApplicationDetails(applicationId);
  }

  @Get('delivered')
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  getDeliveredApplications(
    @Param() param: { status: string },
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.smartbinService.getDeliveredSmartBins(
      Number(page),
      Number(limit),
    );
  }

  @Get('orders')
  getAllBinOrders(
    @Query() filters?: orderBinsDto,
  ) {
    return this.smartbinService.getAllBinOrders(filters);
  }

  @Put('schedule-delivery')
  @ApiQuery({ name: 'applicationId', type: String, required: true })
  @ApiQuery({ name: 'teamMemberId', type: String, required: true })
  @ApiQuery({ name: 'comment', type: String, required: false })
  scheduleDelivery(
    @Query('applicationId') applicationId: string,
    @Query('teamMemberId') teamMemberId: string,
    @Query('comment') comment = '',
  ) {
    return this.smartbinService.scheduleDelivery({applicationId, teamMemberId, comment}
    );
  }

  @Patch(':id/update-status')
  updateBinApplicationStatus(
    @Param('id') id: string,
    @Query('status') status: SmartbinStatus,
  ) {
    const update = this.smartbinService.updateBinApplicationStatus(id, status);

    return new SuccessResponse('Status updated successfully', update);
  }


  @Get(':orderId/tracker')
  async getOrderTimeline(@Param('orderId') orderId: string) {
    return this.smartbinService.getOrderTimeline(orderId);
  }
}
