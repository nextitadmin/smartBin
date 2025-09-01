import { Test, TestingModule } from '@nestjs/testing';
import { AgentSmartbinService } from './bin-management.service';

describe('AgentSmartbinService', () => {
  let service: AgentSmartbinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentSmartbinService],
    }).compile();

    service = module.get<AgentSmartbinService>(AgentSmartbinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
