import { Test, TestingModule } from '@nestjs/testing';
import { SmartBinController } from './smart-bin.controller';

describe('SmartBinController', () => {
  let controller: SmartBinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmartBinController],
    }).compile();

    controller = module.get<SmartBinController>(SmartBinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
