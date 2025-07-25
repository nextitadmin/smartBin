import { Test, TestingModule } from '@nestjs/testing';
import { BinApplicationService } from './smart-bin.service';

describe('BinApplicationService', () => {
  let service: BinApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BinApplicationService],
    }).compile();

    service = module.get<BinApplicationService>(BinApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
