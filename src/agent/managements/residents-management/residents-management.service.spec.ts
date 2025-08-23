import { Test, TestingModule } from '@nestjs/testing';
import { ResidentsManagementService } from './residents-management.service';

describe('ResidentsManagementService', () => {
  let service: ResidentsManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResidentsManagementService],
    }).compile();

    service = module.get<ResidentsManagementService>(ResidentsManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
