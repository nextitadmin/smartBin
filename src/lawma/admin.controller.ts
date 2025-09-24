import { Controller,Post,Get, Param, Query, Body } from '@nestjs/common';
import {  ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportType } from '@models/report.model';
import { Types } from 'mongoose';
import { ReportService } from '@src/report/report.service';
import { CreateAdminReportDto, GetReportsDto } from '@src/report/dtos/report.dto';
import { SuccessResponse } from '@common/http';
import { AdminAuth,AuthenticatedAdmin } from '@common/decorators/auth.decorator';
import { AdminUser } from '@common/types';


@ApiTags('Admin-Report')
@Controller({
    path: 'lawma/admin/reports',   
    version: '1',
})
@AdminAuth()
export class AdminReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post('report')
    async createReport(
      
        @AuthenticatedAdmin() admin: AdminUser,
          @Body() dto: CreateAdminReportDto,
    ) {
        const data = await this.reportService.generateAdminReport( admin, dto);
        return data;
    }

  
 
    @Get()
    @ApiQuery({ name: 'type', enum: ReportType, required: false })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false,})
    async getReports(@AuthenticatedAdmin() admin: AdminUser, @Query() filters: GetReportsDto ,@Query('page') page =1, limit= 10) {
        const reports = await this.reportService.getAdminReports(admin, filters, page, limit);
        return new SuccessResponse(
            'Reports retrieved successfully',
            reports,
        );
    }

 @Get(':id')
    async getReportById(@AuthenticatedAdmin() admin: AdminUser, @Param('id') id: string) {
        const report = await this.reportService.getAdminReportById(id,admin);
        return new SuccessResponse(
            'Report retrieved successfully',
            report,
        );
    }

}
