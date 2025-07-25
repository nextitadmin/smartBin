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
    @IsNotEmpty()
    payerId: string;

    @ApiProperty()
    @IsString()
    binType: BinType;

    @ApiProperty()
    @IsString()
    status: SmartbinStatus;

    @ApiProperty()
    @IsString()
    customerType: UserRole;

    @ApiProperty()
    @IsString()
    lawmaCustomerType?: LAWMACustomerType;

    @ApiProperty()
    @IsString()
    paymentMethod?: PaymentMethod;

    @ApiProperty()
    @IsString()
    buildingName?: string;

    @ApiProperty()
    @IsString()
    address?: string;

    @ApiProperty()
    @IsString()
    businessType?: string;

    @ApiProperty()
    @IsString()
    email?: string;

    @ApiProperty()
    @IsString()
    phoneNumber?: string;

    @ApiProperty()
    @IsNumber()
    amount?: number;

    @ApiProperty()
    @IsString()
    branch?: string;

    @ApiProperty()
    @IsString()
    closestLandmark?: string;

    @ApiProperty()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsString()
    businessName?: string;

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
    localGovernmentArea?: string;
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
