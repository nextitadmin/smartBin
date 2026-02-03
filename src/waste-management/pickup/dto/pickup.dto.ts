import { Status } from '@models/pickup';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
} from 'class-validator';

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

export class GetPickupDto {
  @ApiPropertyOptional({ enum: Status })
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

export class GetPickupsForPspDto {
  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  lga?: string;

  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;
}

export class AssignTeamMemberDto {
  @ApiProperty()
  @IsString()
  teamMemberId: string;

  @ApiProperty()
  @IsEmail()
  teamMemberEmail: string;

  @ApiProperty()
  @IsString()
  note: string;
}

export class UpdatePickupStatusDto {
  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  status: Status;
}
