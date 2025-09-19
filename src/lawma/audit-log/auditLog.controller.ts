import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuditLogService } from './auditLog.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { SuccessResponse } from '@common/http';

@ApiTags('Admin/Audit Logs')
@Controller({
  path: 'lawma/auditlogs',
  version: '1',
})
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startdate', required: false, type: String })
  @ApiQuery({ name: 'enddate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  async getAllLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('startdate') startDate = '',
    @Query('enddate') endDate = '',
  ) {
    const response = await this.auditLogService.getAllLogs({
      search,
      startDate,
      endDate,
      page,
      limit,
    });
    return new SuccessResponse('logs fetched', response);
  }

  @Get(':id')
  async getLogDetails(@Param('id') id: string) {
    const logDetails = await this.auditLogService.getLogDetails(id);
    return new SuccessResponse('log details fetched', logDetails);
  }
}
