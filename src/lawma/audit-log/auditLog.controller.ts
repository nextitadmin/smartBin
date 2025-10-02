import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuditLogService } from './auditLog.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { SuccessResponse } from '@common/http';
import { AuditLogQueryDto } from './dto/auditLog.dto';
import { LogStatement } from './dto/event';
import { AdminAuth } from '@common/decorators/auth.decorator';

@ApiTags('Admin/Audit Logs')
@Controller({
  path: 'lawma/auditlogs',
  version: '1',
})
@AdminAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getAllLogs(
    @Query() query:AuditLogQueryDto
  ) {
    const response = await this.auditLogService.getAllLogs(query);
    return new SuccessResponse('logs fetched', response);
  }

  @Get('/activityTypes')
  async getActivityTypes() {
    const data = Object.entries(LogStatement).map(([key, value]) => ({
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
