import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { AuthenticatedCorporate, CorporateAuth } from '@common/decorators/auth.decorator';
import { CorporateUser } from '@common/types';
import { ReportService } from '@src/report/report.service';
import {
    CreateReportDto,
    ReportResponseDto,
    FullReportResponseDto,
} from '@src/report/dtos/report.dto';
import { ReportType } from '@models/report.model';
import { ApiQuery } from '@nestjs/swagger';
import { SuccessResponse } from '@common/http';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Corporate - Reports')
@Controller({
    path: 'corporate/report',
    version: '1',
})
@CorporateAuth()
export class CorporateReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post()
    @ApiResponse({ status: 201, description: 'Report generated successfully', type: ReportResponseDto })
    async generateReport(
        @Body() dto: CreateReportDto,
        @AuthenticatedCorporate() corporate: CorporateUser,
    ) {
        const response = await this.reportService.generateReport(dto, corporate);
        return new SuccessResponse('Report generated successfully', response.data);
    }

    @Get('summary')
    @ApiQuery({ name: 'reportType', enum: ReportType })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async getReportSummary(
        @AuthenticatedCorporate() corporate: CorporateUser,
        @Query('reportType') reportType: ReportType,
        @Query('page') page = 1,
        @Query('limit') limit = 3,
    ) {
        const summary = await this.reportService.getReportSummary(
            reportType,
            corporate,
            page,
            limit
        );
        return new SuccessResponse('Summary fetched', summary);
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'Report retrieved successfully', type: FullReportResponseDto })
    async getReport(
        @AuthenticatedCorporate() corporate: CorporateUser,
        @Param('id') id: string,

    ) {
        const report = await this.reportService.getReportById(id, corporate);
        return new SuccessResponse('Report retrieved successfully', report);
    }
}
