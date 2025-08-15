
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class CreateTeamMemberDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    branch?: string;


}


export class UpdateTeamMemberDto extends PartialType(CreateTeamMemberDto) { }
