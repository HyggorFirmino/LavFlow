import { Test, TestingModule } from '@nestjs/testing';
import { OrdensService } from './ordens.service';

describe('OrdensService', () => {
  let service: OrdensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdensService],
    }).compile();

    service = module.get<OrdensService>(OrdensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
