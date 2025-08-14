import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import {
  AuthenticatedResident,
  ResidentAuth,
} from '@common/decorators/auth.decorator';
import { ResidentUser } from '@common/types';
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

@ApiTags('Resident- Reports')
@Controller({
  path: 'resident/reports',
  version: '1',
})
@ResidentAuth()
export class ResidentReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Report generated successfully',
    type: ReportResponseDto,
  })
  async generateReport(
    @Body() dto: CreateReportDto,
    @AuthenticatedResident() resident: ResidentUser,
  ) {
    const response = await this.reportService.generateReport(dto, resident);
    return new SuccessResponse('Report generated successfully', response.data);
  }

  // getAllReportsByUser
  @Get()
  @ApiQuery({ name: 'type', enum: ReportType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getReports(
    @AuthenticatedResident() resident: ResidentUser,
    @Query() filters: GetReportsDto,
  ) {
    const reports = await this.reportService.getReportsByUser(
      resident,
      filters,
    );
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
    @AuthenticatedResident() resident: ResidentUser,
    @Param('id') id: string,
  ) {
    const report = await this.reportService.getReportById(id, resident);
    return new SuccessResponse('Report retrieved successfully', report);
  }
}
