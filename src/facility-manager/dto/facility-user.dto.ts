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

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  localGovernment?: string;

  @IsString()
  @IsOptional()
  closestLandmark?: string;

  @IsEnum(LawmaCustomerType)
  @IsOptional()
  lawmaCustomerType?: LawmaCustomerType;

  @IsEnum(BinType)
  @IsNotEmpty()
  binType: BinType;
}

export class UpdateFacilityUserDto extends PartialType(CreateFacilityUserDto) {}
