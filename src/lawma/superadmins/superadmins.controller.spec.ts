import { Test, TestingModule } from '@nestjs/testing';
import { SuperadminsController } from './superadmins.controller';

describe('SuperadminsController', () => {
  let controller: SuperadminsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperadminsController],
    }).compile();

    controller = module.get<SuperadminsController>(SuperadminsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
