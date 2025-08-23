import { ApiProperty } from '@nestjs/swagger';
import { AddCorporateBranchDto } from '@src/corporate/dto/corporate.dto';
import { IsDefined, IsEmail, IsString } from 'class-validator';

export class CreateAgentCorporateAccountDto {
  @ApiProperty()
  @IsDefined()
  payerId: string;

  @ApiProperty()
  @IsString()
  businessName: string;

  @ApiProperty({ required: false })
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ type: [AddCorporateBranchDto] })
  @IsDefined()
  branches: AddCorporateBranchDto[];

  @ApiProperty()
  @IsString()
  @IsDefined()
  password: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  confirmPassword: string;
}
