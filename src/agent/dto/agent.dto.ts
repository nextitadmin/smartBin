import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsString } from 'class-validator';

export class CreateAgentAccountDto {
  @ApiProperty()
  @IsMongoId()
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
