import { IsOptional, IsEnum, IsObject, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from '@models/report.model';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';



export class CreateReportDto {
    @ApiProperty({ enum: ReportType, enumName: 'ReportType', description: 'Type of report to generate' })
    type: ReportType;

    @ApiProperty({
        required: false,
        type: Object,
        description: 'Optional filters like startDate, endDate, branch, etc.',
    })

    @ApiPropertyOptional({ type: String, format: 'date-time' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ type: String, format: 'date-time' })
    @IsOptional()
    @IsDateString()
    endDate?: string;


    @IsOptional()
    @IsObject()
    filters?: Record<string, any>;
}

export class GetReportsDto {
    @ApiProperty()
    @IsOptional()
    type?: ReportType;

    @ApiProperty()
    @IsOptional()
    @Type(() => Date)
    startDate?: Date;

    @ApiProperty()
    @IsOptional()
    @Type(() => Date)
    endDate?: Date;
}

export class ReportResponseDto {
    @ApiProperty({ description: 'The unique identifier of the report generation task.' })
    id: string;

    @ApiProperty({ enum: ReportType, description: 'The type of the generated report.' })
    type: ReportType;

    @ApiProperty({ description: 'The email of the user who generated the report.' })
    generatedBy: string;

    @ApiProperty({ description: 'The timestamp when the report was generated.' })
    generatedAt: Date;

    @ApiProperty({ description: 'The total number of records in the generated report.' })
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
