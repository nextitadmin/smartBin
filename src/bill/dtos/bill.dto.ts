import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BillStatus, PaymentMethod } from '@models/bill.model';



export class BillResponseDto {
    @ApiProperty() id: string;

    @ApiProperty() billId: string;

    @ApiProperty() amount: number;

    @ApiProperty() service: string;

    @ApiProperty() dueDate: Date;

    @ApiProperty({ enum: BillStatus })
    status: BillStatus;

    @ApiProperty({ enum: PaymentMethod, required: false })
    paymentMethod?: PaymentMethod;

    @ApiProperty({ required: false })
    paidAt?: Date;
}

export class FacilityBillResponseDto extends BillResponseDto {
    @ApiProperty() customerName: string;
}

export class CorporateBillResponseDto extends BillResponseDto {
    @ApiProperty() branch: string;
}



export class PayBillDto {
    @ApiProperty()
    @IsString()
    billId: string;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    channel?: string;
}
