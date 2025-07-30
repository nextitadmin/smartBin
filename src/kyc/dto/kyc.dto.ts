import { Gender } from '@models/types';
import { LawmaCustomerType } from '@models/users/resident.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsArray, ArrayNotEmpty, IsMongoId } from 'class-validator';

export class PersonalInfoDto {
  @ApiProperty()
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsString()
  nationality?: string;

  @ApiProperty()
  @IsString()
  gender?: Gender;

  @ApiProperty()
  @IsString()
  lawmaCustomerType?: LawmaCustomerType;
}


export class CompanyInfoDto {
  @ApiProperty()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsString()
  businessRegistrationNumber?: string;

  @ApiProperty()
  @IsString()
  businessSector?: string;
}

export class IdVerificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ninNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idDocument: string;
}

export class AddressVerificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buildingType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  houseNumber: string;

  @ApiProperty()
  @IsString()
  flatNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  localGovernment: string;

  @ApiProperty()
  @IsString()
  closestLandmark?: string;
}


export class SignatoriesDto {
  @ApiProperty({ type: [String], description: 'Array of valid MongoDB ObjectIds' })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true, message: "Signatory is not valid or doesn't exist" })
  signatories: string[];
}