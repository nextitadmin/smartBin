import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuditLogService } from './auditLog.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { SuccessResponse } from '@common/http';
import { logStatement } from './dto/auditLog.dto';

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
  @ApiQuery({ name: 'activityType', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  async getAllLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('activityType') activityType = '',
    @Query('role') role = '',
    @Query('startdate') startDate = '',
    @Query('enddate') endDate = '',
  ) {
    const response = await this.auditLogService.getAllLogs({
      search,
      startDate,
      endDate,
      activityType,
      role,
      page,
      limit,
    });
    return new SuccessResponse('logs fetched', response);
  }

  @Get('/activityTypes')
  async getActivityTypes() {
    const data = Object.entries(logStatement).map(([key, value]) => ({
      value: key,
      label: value,
    }));

    return new SuccessResponse('activity types fetched', data);
  }

  @Get('/:id')
  async getLogDetails(@Param('id') id: string) {
    const logDetails = await this.auditLogService.getLogDetails(id);
    return new SuccessResponse('log details fetched', logDetails);
  }
}
