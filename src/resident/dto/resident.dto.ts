import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsString, MinLength } from 'class-validator';

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