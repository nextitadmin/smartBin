import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ReportService } from './report.service';
import { CreateAdminReportDto, GetReportsDto } from './dtos/report.dto';
import { MessagePattern } from '@nestjs/microservices';
import { AdminMessagePatternCommands } from '@src/shared/constants';
import { SuccessResponse } from '@common/http';



@ApiTags('Admin-Report')
// @ApiBearerAuth('access-token')
// @UseGuards(AuthGuard)
@Controller()
export class AdminReportController {
    constructor(private readonly reportService: ReportService) { }


    @MessagePattern({ cmd: AdminMessagePatternCommands.Report.CreateReport })
    async createReport(payload: { adminId: string } & CreateAdminReportDto) {
        const data = await this.reportService.generateAdminReport(payload.adminId, payload);
        return new SuccessResponse(
            'Report generated successfully',
            data,
        );
    }

    @MessagePattern({ cmd: AdminMessagePatternCommands.Report.GetReports })
    getReports(payload: { adminId: string; filters: GetReportsDto }) {
        return this.reportService.getAdminReports(payload.adminId, payload.filters);
    }

    @MessagePattern({ cmd: AdminMessagePatternCommands.Report.GetReport })
    getReportById(payload: { reportId: string }) {
        return this.reportService.getAdminReportById(payload.reportId);
    }


}
