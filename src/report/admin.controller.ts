import { Controller,Post,Get, Param, Query, Body } from '@nestjs/common';
import {  ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportType } from '@models/report.model';
import { Types } from 'mongoose';
import { ReportService } from './report.service';
import { CreateAdminReportDto, GetReportsDto } from './dtos/report.dto';
import { SuccessResponse } from '@common/http';



@ApiTags('Admin-Report')
@Controller({
    path: 'admin-report',   
    version: '1',
})
export class AdminReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post('report')
    async createReport(payload: { adminId: string } & CreateAdminReportDto) {
        const data = await this.reportService.generateAdminReport(payload.adminId, payload);
        return data;
    }

  
 
    @Get()
    @ApiQuery({ name: 'type', enum: ReportType, required: false })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    @ApiQuery({ name: 'page', required: false, type: String })
    @ApiQuery({ name: 'limit', required: false, type: String })
    async getReports(payload: { adminId: string, page: string, limit: string } & GetReportsDto) {
        const page = parseInt(payload.page ?? '1', 10);
        const limit = parseInt(payload.limit ?? '10', 10);
        const reports = await this.reportService.getAdminReports(payload.adminId, payload, page, limit);
        return new SuccessResponse(
            'Reports retrieved successfully',
            reports,
        );
    }

 @Get(':id')
    async getReportById(payload: { id: string, adminId: string }) {
        const report = await this.reportService.getAdminReportById(payload.id, payload.adminId);
        return new SuccessResponse(
            'Report retrieved successfully',
            report,
        );
    }

}
