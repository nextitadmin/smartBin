import { BinType, LAWMACustomerType } from '@models/smart-bin.model';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SmartbinStatus } from '@models/smart-bin.model';
import { SmartBinApplicationStatus } from '@models/types/index';

export class BinAppDto {
  userId: string;
  payerId: string;
  binType: string;
  status: string;
  customerType: string;
  customerName?: string;
  lawmaCustomerType?: string;
  paymentMethod?: string;
  buildingName?: string;
  address?: string;
  businessType?: string;
  branchId?: string;
  email?: string;
  phoneNumber?: string;
  branch?: string;
  closestLandmark?: string;
  name?: string;
  businessName?: string;
  buildingType?: string;
  houseName?: string;
  flatNumber?: string;
  localGovernmentArea?: string;
  approvalDate?: Date;
  deliveredOn?: Date;
  deliveredBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  surname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @ApiProperty()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payerId: string;

  @ApiProperty()
  @IsString()
  buildingType?: string;

  @ApiProperty()
  @IsString()
  houseName?: string;

  @ApiProperty()
  @IsString()
  houseNumber?: string;

  @ApiProperty()
  @IsString()
  flatNumber?: string;

  @ApiProperty()
  @IsBoolean()
  useYourAddress?: boolean;

  @ApiProperty()
  @IsString()
  streetName?: string;

  @ApiProperty()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsString()
  closestLandmark?: string;

  @ApiProperty()
  @IsString()
  localGovernmentArea?: string;

  @ApiProperty({ enum: LAWMACustomerType, required: false })
  @IsOptional()
  @IsEnum(LAWMACustomerType, {
    message: `Lawma Customer Type must be either '${LAWMACustomerType.New}' or '${LAWMACustomerType.Returning}'`,
  })
  lawmaCustomerType?: LAWMACustomerType;

  @ApiProperty({ enum: BinType, default: BinType.Smart })
  @IsEnum(BinType, {
    message: `Bin Type must be either '${BinType.Smart}' or '${BinType.Non_Smart}'`,
  })
  binType: BinType = BinType.Smart;

  @ApiProperty()
  @IsString()
  buildingName?: string;
}

export class CreateBusinessApplicationDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  surname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  tenantName?: string;

  @ApiProperty()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiProperty()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsString()
  closestLandmark?: string;

  @ApiProperty()
  @IsString()
  localGovernmentArea?: string;

  @ApiProperty()
  @IsString()
  branch?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiptId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ enum: LAWMACustomerType, required: false })
  @IsOptional()
  @IsEnum(LAWMACustomerType, {
    message: `Lawma Customer Type must be either '${LAWMACustomerType.New}' or '${LAWMACustomerType.Returning}'`,
  })
  lawmaCustomerType?: LAWMACustomerType;

  @ApiProperty({ enum: BinType, default: BinType.Smart })
  @IsEnum(BinType, {
    message: `Bin Type must be either '${BinType.Smart}' or '${BinType.Non_Smart}'`,
  })
  binType: BinType = BinType.Smart;

  @ApiProperty()
  @IsString()
  @IsOptional()
  transactionReference?: string;
}

export class CreateFacilityApplicationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payerId: string;

  @ApiProperty()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsString()
  closestLandmark?: string;

  @ApiProperty()
  @IsString()
  buildingName?: string;

  @ApiProperty()
  @IsString()
  buildingType?: string;

  @ApiProperty()
  @IsString()
  localGovernmentArea?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiptId?: string;

  @ApiProperty({
    description: 'Facility ID (MongoDB ObjectId)',
    example: '64f8b6d82f2e4c4b1c7e92a1',
  })
  @IsMongoId({ message: 'Facility ID is invalid' })
  @IsOptional()
  facilityId?: string;

  @ApiProperty({ enum: BinType, default: BinType.Smart })
  @IsEnum(BinType, {
    message: `Bin Type must be either '${BinType.Smart}' or '${BinType.Non_Smart}'`,
  })
  binType: BinType = BinType.Smart;

  @ApiProperty()
  @IsString()
  @IsOptional()
  transactionReference?: string;
}

export class UpdateSmartBinStatusDto {
  @IsEnum(SmartBinApplicationStatus)
  @IsNotEmpty()
  status: SmartBinApplicationStatus;
}
