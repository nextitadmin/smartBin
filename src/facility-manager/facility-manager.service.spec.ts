import { Test, TestingModule } from '@nestjs/testing';
import { FacilityManagerService } from './facility-manager.service';

describe('FacilityManagerService', () => {
  let service: FacilityManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacilityManagerService],
    }).compile();

    service = module.get<FacilityManagerService>(FacilityManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
