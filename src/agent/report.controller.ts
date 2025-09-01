import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import {
    AuthenticatedAgent,
    AgentAuth,
} from '@common/decorators/auth.decorator';
import { AgentUser } from '@common/types';
import { ReportService } from '@src/report/report.service';
import {
    CreateReportDto,
    GetReportsDto,
    ReportResponseDto,
    FullReportResponseDto,
} from '@src/report/dtos/report.dto';
import { ReportType } from '@models/report.model';
import { ApiQuery } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';

@ApiTags('Agent-Reports')
@Controller({
    path: 'agent/reports',
    version: '1',
})
@AgentAuth()
export class AgentReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post()
    @ApiResponse({
        status: 201,
        description: 'Report generated successfully',
        type: ReportResponseDto,
    })
    async generateReport(
        @Body() dto: CreateReportDto,
        @AuthenticatedAgent() agent: AgentUser,
    ) {
        const response = await this.reportService.generateReport(dto, agent);
        return new SuccessResponse('Report generated successfully', response.data);
    }



    // getAllReportsByUser
    @Get()
    @ApiQuery({ name: 'type', enum: ReportType, required: false })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    async getReports(@AuthenticatedAgent() agent: AgentUser, @Query() filters: GetReportsDto) {
        const reports = await this.reportService.getReportsByUser(agent, filters);
        return new SuccessResponse('Reports fetched', reports);
    }

    // getReportbyId
    @Get(':id')
    @ApiResponse({
        status: 200,
        description: 'Report retrieved successfully',
        type: FullReportResponseDto,
    })
    async getReport(
        @AuthenticatedAgent() agent: AgentUser,
        @Param('id') id: string,
    ) {
        const report = await this.reportService.getReportById(id, agent);
        return new SuccessResponse('Report retrieved successfully', report);
    }
}
