import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

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