import { Test, TestingModule } from '@nestjs/testing';
import { CorporatesManagementService } from './corporates-management.service';

describe('CorporatesManagementService', () => {
  let service: CorporatesManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorporatesManagementService],
    }).compile();

    service = module.get<CorporatesManagementService>(CorporatesManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
