import { UserRole } from '@models/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePickupDto {
  @ApiProperty()
  @IsDateString()
  pickupDate: string;

  @ApiProperty()
  @IsString()
  pickupTime: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  branch: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  transactionReference?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}
