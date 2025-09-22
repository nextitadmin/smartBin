import { AdministratorRole } from '@models/administrator.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
