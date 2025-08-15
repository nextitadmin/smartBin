import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';


export class CreateFacilityDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    buildingName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    buildingType: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    localGovernment: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    closestLandmark: string;
}


export class UpdateFacilityDto extends PartialType(CreateFacilityDto) { }
