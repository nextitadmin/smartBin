import { PSPMembersStatus } from '@models/psp-members.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString } from 'class-validator';

export class CreatePspDTO {
  @ApiProperty()
  @IsString()
  company_name: string;

  @ApiProperty()
  @IsString()
  administrator_name: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  administrator_email: string;

  @ApiProperty()
  @IsString()
  administrator_phone: string;

  @ApiProperty()
  @IsString()
  lga_address: string;

  @ApiProperty()
  @IsString()
  company_address: string;
}

export class CreatePspMembersDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  phone_number: string;
}

export class UpdatePspMembersStatusParamDTO {
  @ApiProperty()
  @IsString()
  pspId: string;

  @ApiProperty()
  @IsString()
  memberId: string;
}

export class UpdatePspMembersStatusBodyDTO {
  @ApiProperty({
    enum: Object.values(PSPMembersStatus),
    example: PSPMembersStatus.ACTIVE,
  })
  @IsString()
  @IsIn(Object.values(PSPMembersStatus))
  status: PSPMembersStatus;
}

export class IdDTO {
  @ApiProperty()
  @IsString()
  id: string;
}
