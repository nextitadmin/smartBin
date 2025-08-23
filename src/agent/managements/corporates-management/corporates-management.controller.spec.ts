import { Test, TestingModule } from '@nestjs/testing';
import { CorporatesManagementController } from './corporates-management.controller';

describe('CorporatesManagementController', () => {
  let controller: CorporatesManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorporatesManagementController],
    }).compile();

    controller = module.get<CorporatesManagementController>(CorporatesManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
