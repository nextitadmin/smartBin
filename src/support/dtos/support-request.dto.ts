import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateSupportRequestDto {

    @ApiProperty()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    message: string;
}
