import { Test, TestingModule } from '@nestjs/testing';
import { MaydayService } from './mayday.service';

describe('MaydayService', () => {
  let service: MaydayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaydayService],
    }).compile();

    service = module.get<MaydayService>(MaydayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
