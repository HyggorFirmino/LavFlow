import { Test, TestingModule } from '@nestjs/testing';
import { OrdensController } from './ordens.controller';
import { OrdensService } from './ordens.service';

describe('OrdensController', () => {
  let controller: OrdensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdensController],
      providers: [OrdensService],
    }).compile();

    controller = module.get<OrdensController>(OrdensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
