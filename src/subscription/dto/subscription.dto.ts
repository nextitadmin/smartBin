import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class SubscribePlanDTO {
  @ApiProperty({
    description: 'The ID of the subscription plan to subscribe to',
    type: String,
    example: '60c72b2f9b1d4c001c8b2f1',
  })
  @IsMongoId()
  plan: string;

  @ApiProperty({
    description: 'Transaction reference paid by the user',
    type: String,
    example: 'txn_1234567890',
  })
  @IsString()
  transactionReference: string;
}
