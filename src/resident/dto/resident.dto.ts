import {
  BinType,
  LAWMACustomerType,
} from '@models/smart-bin.model';
import { LawmaCustomerType } from '@models/users/resident.model';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateResidentAccountDto {
  @ApiProperty()
  payerId: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;
}

export class ResidentLoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class ProfileDto {
  @ApiProperty()
  imageUrl: string;
}

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  surname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @ApiProperty()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payerId: string;

  @ApiProperty()
  @IsString()
  buildingType?: string;

  @ApiProperty()
  @IsBoolean()
  useYourAddress?: boolean;

  @ApiProperty()
  @IsString()
  streetName?: string;

  @ApiProperty()
  @IsString()
  houseName?: string;

  @ApiProperty()
  @IsString()
  houseNumber?: string;

  @ApiProperty()
  @IsString()
  flatNumber?: string;

  @ApiProperty()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsString()
  closestLandmark?: string;

  @ApiProperty()
  @IsString()
  localGovernmentArea?: string;

  @ApiProperty({ enum: LAWMACustomerType, required: false })
  @IsOptional()
  @IsEnum(LawmaCustomerType, {
    message: `Lawma Customer Type must be either be '${LAWMACustomerType.New}' or '${LAWMACustomerType.Returning}'`,
  })
  lawmaCustomerType?: LAWMACustomerType;

  @ApiProperty({ enum: BinType, default: BinType.Smart })
  @IsEnum(BinType, {
    message: `Bin Type must be either be '${BinType.Smart}' or '${BinType.Non_Smart}'`,
  })
  binType: BinType = BinType.Smart;

  @ApiProperty()
  @IsString()
  buildingName?: string;

  @ApiProperty()
  @IsString()
  amount?: string;
}

export class VerifyResidentLogin {
  @ApiProperty()
  @IsString()
  code: string;
}

export class ResidentForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResidentVerifyResetCodeDto {
  @ApiProperty()
  @IsString()
  code: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;
}

export class GetApplicationParamDto {
  @ApiProperty()
  @IsString()
  applicationId: string;
}
