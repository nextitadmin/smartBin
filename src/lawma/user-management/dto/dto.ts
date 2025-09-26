import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;


  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
 page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  limit?: number;

}
