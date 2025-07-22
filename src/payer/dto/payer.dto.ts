import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Max, MaxLength } from 'class-validator';

export class CreatePayerDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  dateOfBirth: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    maxLength: 11,
  })
  @MaxLength(11, {
    message: 'NIN cannot be more than 11 digits',
  })
  nin: string;
}
