import { AdministratorRole } from '@models/administrator.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString,IsEnum,IsOptional,IsEmail } from 'class-validator';

export class CreateLawmaTeamDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  role: AdministratorRole;
}

export class UpdateLawmaTeamStatusDto {
  @ApiProperty()
  @IsString()
  status: string;
}

export class UpdateTeamMemberDetailsDto{
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  role?: AdministratorRole;
}
