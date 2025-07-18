import { Test, TestingModule } from '@nestjs/testing';
import { FacilityManagerController } from './facility-manager.controller';
import { FacilityManagerService } from './facility-manager.service';

describe('FacilityManagerController', () => {
  let controller: FacilityManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityManagerController],
      providers: [FacilityManagerService],
    }).compile();

    controller = module.get<FacilityManagerController>(FacilityManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
