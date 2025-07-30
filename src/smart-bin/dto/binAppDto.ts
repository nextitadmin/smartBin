import { BinType, LAWMACustomerType } from '@models/smart-bin.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmpty, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  customerName?: string;

  @ApiProperty()
  @IsString()
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
  receiptId?: string;

  @ApiProperty()
  @IsString()
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
}
