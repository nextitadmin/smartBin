import { Status } from '@models/pickup';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsString , IsOptional} from 'class-validator';

export class RequestPickupDto {
  @ApiProperty()
  @IsDateString()
  pickupDateTime: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  note: string;
}


export class GetPickupDto{
  @ApiPropertyOptional( {enum: Status})
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;



}