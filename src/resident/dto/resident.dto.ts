import { BinType, LAWMACustomerType, PaymentMethod, SmartbinStatus } from '@models/smart-bin.model';
import { UserRole } from '@models/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsString, MinLength, IsNotEmpty, IsNumber } from 'class-validator';

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

export class ProfileDto{
  @ApiProperty()
  imageUrl: string
}

export class CreateApplicationDto{
    @ApiProperty()
    @IsString()
    firstName:string

    @ApiProperty()
    @IsString()
    surname:string

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
    @IsString()
    houseName?: string;

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

    @ApiProperty()
    @IsString()
    lawmaCustomerType?: LAWMACustomerType;

    @ApiProperty()
    @IsString()
    binType: BinType;

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
