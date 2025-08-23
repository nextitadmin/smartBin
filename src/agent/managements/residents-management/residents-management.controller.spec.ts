import { Test, TestingModule } from '@nestjs/testing';
import { ResidentsManagementController } from './residents-management.controller';

describe('ResidentsManagementController', () => {
  let controller: ResidentsManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResidentsManagementController],
    }).compile();

    controller = module.get<ResidentsManagementController>(ResidentsManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
