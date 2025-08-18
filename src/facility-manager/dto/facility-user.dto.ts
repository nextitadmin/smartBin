import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BinType, LawmaCustomerType } from '@models/facility-users.model';
import { PartialType } from '@nestjs/mapped-types';

export class CreateFacilityUserDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  houseNumber?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  flatNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buildingName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  buildingType?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  localGovernment?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  closestLandmark?: string;

  @ApiProperty()
  @IsEnum(LawmaCustomerType)
  @IsOptional()
  lawmaCustomerType?: LawmaCustomerType;

  @ApiProperty()
  @IsEnum(BinType)
  @IsOptional()
  binType: BinType;
}

export class UpdateFacilityUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  houseNumber?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  flatNumber?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  buildingName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  buildingType?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  localGovernment?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  closestLandmark?: string;

  @ApiProperty()
  @IsEnum(LawmaCustomerType)
  @IsOptional()
  lawmaCustomerType?: LawmaCustomerType;

  @ApiProperty()
  @IsEnum(BinType)
  @IsOptional()
  binType: BinType;
}

export class AssignBinToTenantDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty()
  @IsNotEmpty()
  binId: string;
}
