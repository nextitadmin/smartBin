import { Test, TestingModule } from '@nestjs/testing';
import { SubcriptionService } from './subscription.service';

describe('SubcriptionService', () => {
  let service: SubcriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubcriptionService],
    }).compile();

    service = module.get<SubcriptionService>(SubcriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
