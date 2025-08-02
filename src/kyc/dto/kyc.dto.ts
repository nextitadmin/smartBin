import { Gender } from '@models/types';
import { LawmaCustomerType } from '@models/users/resident.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IsArray, ArrayNotEmpty, IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CompanyInformationDto {
  @ApiProperty()
  @IsString()
  businessName: string;

  @ApiProperty()
  @IsString()
  businessRegistrationNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsString()
  businessSector: string;

  @ApiProperty()
  @IsString()
  address: string;
}

class BusinessRegistrationCertificateDto {
  @ApiProperty()
  @IsString()
  nin: string;

  @ApiProperty()
  @IsString()
  idDocument: string;
}

class AuthorizedSignatoryDto {
  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  nationality: string;

  @ApiProperty()
  @IsString()
  gender: string;

  @ApiProperty()
  @IsString()
  jobTitle: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  idDocumentNo: string;

  @ApiProperty()
  @IsString()
  idDocument: string;
}

export class CreateKycDto {
  @ApiProperty({ type: CompanyInformationDto })
  @ValidateNested()
  @Type(() => CompanyInformationDto)
  companyInformation: CompanyInformationDto;

  @ApiProperty({ type: BusinessRegistrationCertificateDto })
  @ValidateNested()
  @Type(() => BusinessRegistrationCertificateDto)
  businessRegistrationCertificate: BusinessRegistrationCertificateDto;

  @ApiProperty({ type: [AuthorizedSignatoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorizedSignatoryDto)
  authorizedSignatories: AuthorizedSignatoryDto[];
}

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
  @ApiProperty({
    type: [String],
    description: 'Array of valid MongoDB ObjectIds',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true, message: "Signatory is not valid or doesn't exist" })
  signatories: string[];
}

export class TeamMemberDto {
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
  @IsNotEmpty()
  nationality: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idDocumentNo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idDocument: string;
}

export class UpdateTeamMemberDto {
  @ApiProperty({ required: false })
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  nationality?: string;

  @ApiProperty({ required: false })
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ required: false })
  @IsString()
  jobTitle?: string;

  @ApiProperty({ required: false })
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  idDocumentNo?: string;

  @ApiProperty({ required: false })
  @IsString()
  idDocument?: string;
}
