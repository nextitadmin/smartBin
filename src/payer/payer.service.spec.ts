import { Test, TestingModule } from '@nestjs/testing';
import { PayerService } from './payer.service';

describe('PayerService', () => {
  let service: PayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayerService],
    }).compile();

    service = module.get<PayerService>(PayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
