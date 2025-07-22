import { Test, TestingModule } from '@nestjs/testing';
import { StatusKanbanService } from './status-kanban.service';

describe('StatusKanbanService', () => {
  let service: StatusKanbanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusKanbanService],
    }).compile();

    service = module.get<StatusKanbanService>(StatusKanbanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
