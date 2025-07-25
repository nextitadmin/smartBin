import { BinType, LAWMACustomerType } from "@models/smart-bin.model";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class BinAppDto {
    userId: string;
    payerId: string;
    binType: string;
    status: string;
    customerType: string;
    lawmaCustomerType?: string;
    paymentMethod?: string;
    buildingName?: string;
    address?: string;
    businessType?: string;
    email?: string;
    phoneNumber?: string;
    amount?: number;
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

export class CreateApplicationDto{
    @ApiProperty()
    @IsString()
    firstName:string

    @ApiProperty()
    @IsString()
    surname:string

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
    flatNumber?: string;

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
    lawmaCustomerType?: LAWMACustomerType;

    @ApiProperty({ default: BinType.Smart })
    @IsString()
    binType: BinType = BinType.Smart;

    @ApiProperty()
    @IsString()
    buildingName?: string;

    @ApiProperty()
    @IsString()
    amount?: string;

}