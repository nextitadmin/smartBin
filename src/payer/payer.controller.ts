import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PayerService } from './payer.service';
import { CreatePayerDto } from './dto/payer.dto';
import { SuccessResponse } from '@common/http';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payer')
@Controller({
  path: 'payer',
  version: '1',
})
export class PayerController {
  constructor(private readonly payerService: PayerService) {}

  @Post()
  async createPayer(@Body() body: CreatePayerDto) {
    const payerResponse = await this.payerService.createPayer(body);
    return new SuccessResponse(
      payerResponse.message || 'payer account created',
      payerResponse.data,
    );
  }

  @Get(':payerId')
  async getPayer(@Param('payerId') payerId: string) {
    const payerDetails = await this.payerService.getPayerByPayerId(payerId);
    return new SuccessResponse('payer details fetched', payerDetails);
  }
}
