import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DashboardFilterType {
   TODAY = 'today',
   THIS_MONTH = 'thismonth',
   THIS_YEAR = 'thisyear',
   MTD = 'mtd',
   YTD = 'ytd',
}

export class DashboardFiltersDto {
   @ApiPropertyOptional({ enum: DashboardFilterType })
   @IsOptional()
   filter?: DashboardFilterType;

   @ApiPropertyOptional()
   @IsOptional()
   pspId?: string;

   @ApiPropertyOptional()
   @IsOptional()
   lgaId?: string;

   @ApiPropertyOptional()
   @IsOptional()
   year?: number;
}

export class RevenueOverviewDto {
   @ApiPropertyOptional()
   @IsOptional()
   year?: number;

   @ApiPropertyOptional()
   @IsOptional()
   page?: number;

   @ApiPropertyOptional()
   @IsOptional()

   limit?: number;
}