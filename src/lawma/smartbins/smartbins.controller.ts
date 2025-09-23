import { Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { SmartBinService } from '@src/smart-bin/smart-bin.service';
import { LawmaSmartbinsService } from './smartbins.service';
import { AdminAuth } from '@common/decorators/auth.decorator';

@ApiTags('Admin/Smartbin Applications')
@Controller({
  path: 'lawma/smartbins',
  version: '1',
})
@AdminAuth()
export class SmartbinsController {
  constructor(private readonly smartbinService: LawmaSmartbinsService) {}

  @Get('overview')
  getOverview() {
    return this.smartbinService.getSmartBinOverview();
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
}
