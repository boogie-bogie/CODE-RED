import { Test, TestingModule } from '@nestjs/testing';
import { DestinationRiskController } from './destination-risk.controller';

describe('DestinationRiskController', () => {
  let controller: DestinationRiskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DestinationRiskController],
    }).compile();

    controller = module.get<DestinationRiskController>(DestinationRiskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
