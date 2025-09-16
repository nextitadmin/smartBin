import { Controller} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ReportService } from './report.service';
import { CreateAdminReportDto, GetReportsDto } from './dtos/report.dto';
import { MessagePattern } from '@nestjs/microservices';
import { AdminMessagePatternCommands } from '@src/shared/constants';
import { SuccessResponse } from '@common/http';



@ApiTags('Admin-Report')
@Controller()
export class AdminReportController {
    constructor(private readonly reportService: ReportService) { }


    @MessagePattern({ cmd: AdminMessagePatternCommands.Report.CreateReport })
    async createReport(payload: { adminId: string } & CreateAdminReportDto) {
        const data = await this.reportService.generateAdminReport(payload.adminId, payload);
        return data;
    }

    @MessagePattern({ cmd: AdminMessagePatternCommands.Report.GetReports })
    async getReports(payload: { adminId: string, page: string, limit: string } & GetReportsDto) {
        const page = parseInt(payload.page ?? '1', 10);
        const limit = parseInt(payload.limit ?? '10', 10);
        const reports = await this.reportService.getAdminReports(payload.adminId, payload, page, limit);
        return new SuccessResponse(
            'Reports retrieved successfully',
            reports,
        );
    }

    @MessagePattern({ cmd: AdminMessagePatternCommands.Report.GetReport })
    async getReportById(payload: { id: string, adminId: string }) {
        const report = await this.reportService.getAdminReportById(payload.id, payload.adminId);
        return new SuccessResponse(
            'Report retrieved successfully',
            report,
        );
    }

}
