import { Test, TestingModule } from '@nestjs/testing';
import { AgentSmartbinController } from './bin-management.controller';

describe('SmartbinController', () => {
  let controller: AgentSmartbinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentSmartbinController],
    }).compile();

    controller = module.get<AgentSmartbinController>(AgentSmartbinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
