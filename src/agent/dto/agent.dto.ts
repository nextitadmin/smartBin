import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateAgentAccountDto {
  @ApiProperty()
  @IsString()
  payerId: string;

  @ApiProperty()
  @IsString()
  agencyName: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;
}

export class LoginAgentAccountDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class VerifyAgentLogin {
  @ApiProperty()
  @IsString()
  code: string;
}

export class EmailDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;
}
