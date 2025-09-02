import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsOptional, IsString } from 'class-validator';

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

export class ProfileDto {
  @ApiProperty()
  imageUrl: string;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agencyName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
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

export class IdParamDTO {
  @ApiProperty({
    required: true,
  })
  @IsMongoId()
  id: string;
}


export class UploadUserDto {
  customerType: 'resident' | 'corporate';
  payerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
  phoneNumber?: string;
  password: string;
  // ... add more fields as needed
}

export class UploadUsersRequestDto {
  users: UploadUserDto[];
}
