import { Test, TestingModule } from '@nestjs/testing';
import { DestinationRiskService } from './destination-risk.service';

describe('DestinationRiskService', () => {
  let service: DestinationRiskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DestinationRiskService],
    }).compile();

    service = module.get<DestinationRiskService>(DestinationRiskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
