import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  limit?: string;
}
