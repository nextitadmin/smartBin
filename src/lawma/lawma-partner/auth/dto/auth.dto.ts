import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LawmaPartnerLoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class LawmaPartnerVerifyLoginDto {
  @ApiProperty()
  @IsString()
  code: string;
}
