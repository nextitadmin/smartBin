import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LawmaAuthLoginDto {
  @ApiProperty({
    description: 'The email of the administrator',
    example: 'superadmin@lawma.co',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the administrator',
    example: 'password',
  })
  @IsString()
  password: string;
}

export class LawmaAuthVerifyDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  code: string;
}

export class LawmaAuthPasswordResetDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class LawmaAuthCompletePasswordResetDto {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;
}
