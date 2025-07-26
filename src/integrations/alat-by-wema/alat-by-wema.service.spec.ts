import { Test, TestingModule } from '@nestjs/testing';
import { AlatByWemaService } from './alat-by-wema.service';

describe('AlatByWemaService', () => {
  let service: AlatByWemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlatByWemaService],
    }).compile();

    service = module.get<AlatByWemaService>(AlatByWemaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
