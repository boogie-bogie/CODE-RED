import { Test, TestingModule } from '@nestjs/testing';
import { MaydayController } from './mayday.controller';
import { MaydayService } from './mayday.service';

describe('MaydayController', () => {
  let controller: MaydayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaydayController],
      providers: [MaydayService],
    }).compile();

    controller = module.get<MaydayController>(MaydayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
