import { Controller } from '@nestjs/common';
import { PayerService } from './payer.service';

@Controller('payer')
export class PayerController {
  constructor(private readonly payerService: PayerService) {}
}
