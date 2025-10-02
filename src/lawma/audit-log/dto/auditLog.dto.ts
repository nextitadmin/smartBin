import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";


export class AuditLogQueryDto {
  @ApiPropertyOptional({  type: String })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  startdate?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  enddate?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  activityType?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({  type: String })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  limit?: string;
}