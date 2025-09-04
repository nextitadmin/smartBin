import { ApiProperty } from '@nestjs/swagger';
import { AddCorporateBranchDto } from '@src/corporate/dto/corporate.dto';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCorporateBranchDto)
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

export class UpdateAgentCorporateAccountDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsDefined()
  payerId: string;

  @ApiProperty({ required: false })
  @IsString()
  businessName?: string;

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

  @ApiProperty({ type: [AddCorporateBranchDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCorporateBranchDto)
  branches?: AddCorporateBranchDto[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  confirmPassword?: string;
}
