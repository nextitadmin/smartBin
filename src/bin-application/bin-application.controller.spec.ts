import { Test, TestingModule } from '@nestjs/testing';
import { BinApplicationController } from './bin-application.controller';

describe('BinApplicationController', () => {
  let controller: BinApplicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BinApplicationController],
    }).compile();

    controller = module.get<BinApplicationController>(BinApplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
