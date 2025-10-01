import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import {
    AuthenticatedCorporate,
    CorporateAuth,
} from '@common/decorators/auth.decorator';
import { CorporateUser } from '@common/types';
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

@ApiTags('Corporate - Reports')
@Controller({
    path: 'corporate/reports',
    version: '1',
})
@CorporateAuth()
export class CorporateReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post()
    @ApiResponse({
        status: 201,
        description: 'Report generated successfully',
        type: ReportResponseDto,
    })
    async generateReport(
        @Body() dto: CreateReportDto,
        @AuthenticatedCorporate() corporate: CorporateUser,
    ) {
        const response = await this.reportService.generateReport(dto, corporate);
        return new SuccessResponse('Report generated successfully', response.data);
    }



    // getAllReportsByUser
    @Get()
    async getReports(@AuthenticatedCorporate() corporate: CorporateUser, @Query() filters: GetReportsDto) {
        const reports = await this.reportService.getReportsByUser(corporate, filters);
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
        @AuthenticatedCorporate() corporate: CorporateUser,
        @Param('id') id: string,
    ) {
        const report = await this.reportService.getReportById(id, corporate);
        return new SuccessResponse('Report retrieved successfully', report);
    }
}
