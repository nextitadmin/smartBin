import {
  IsOptional,
  IsEnum,
  IsString,
  IsObject,
  IsDateString,
  isEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from '@models/report.model';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum CustomerType {
  Corporate = 'Corporate',
  Resident = 'Resident',
}

export class CreateAdminReportDto {
  @ApiProperty()
  @IsString()
  reportName: string;

  @ApiProperty({
    enum: ReportType,
    enumName: 'ReportType',
    description: 'Type of report to generate',
  })
  type: ReportType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lga?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class CreateReportDto {
  @ApiProperty()
  @IsString()
  reportName: string;

  @ApiPropertyOptional({
    enum: CustomerType,
    enumName: 'CustomerType',
    description: 'Type of customer',
  })
  @IsEnum(CustomerType, { message: 'Invalid customer type' })
  @IsOptional()
  @IsString()
  customerType?: CustomerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({
    enum: ReportType,
    enumName: 'ReportType',
    description: 'Type of report to generate',
  })
  type: ReportType;

  @ApiProperty({
    required: false,
    type: Object,
    description: 'Optional filters like startDate, endDate, branch, etc.',
  })
  @ApiProperty({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class GetReportsDto {
  @ApiPropertyOptional({ enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType, { message: 'Invalid report type' })
  type?: ReportType;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;
}

export class ReportResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the report generation task.',
  })
  id: string;

  @ApiProperty({
    enum: ReportType,
    description: 'The type of the generated report.',
  })
  type: ReportType;

  @ApiProperty({
    description: 'The email of the user who generated the report.',
  })
  generatedBy: string;

  @ApiProperty({ description: 'The timestamp when the report was generated.' })
  generatedAt: Date;

  @ApiProperty({
    description: 'The total number of records in the generated report.',
  })
  totalRecords: number;
}

export class FullReportResponseDto {
  @ApiProperty({ description: 'The unique identifier of the report.' })
  id: string;

  @ApiProperty({ enum: ReportType, description: 'The type of the report.' })
  type: ReportType;

  @ApiProperty({ description: 'The timestamp when the report was generated.' })
  generatedAt: Date;

  @ApiProperty({
    type: Object,
    description: 'The filters used to generate the report.',
  })
  filters: Record<string, any>;

  @ApiProperty({
    type: [Object],
    description: 'The data contained in the report.',
  })
  data: any[];
}
