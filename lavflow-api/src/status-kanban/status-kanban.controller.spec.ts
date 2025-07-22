import { Test, TestingModule } from '@nestjs/testing';
import { StatusKanbanController } from './status-kanban.controller';
import { StatusKanbanService } from './status-kanban.service';

describe('StatusKanbanController', () => {
  let controller: StatusKanbanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusKanbanController],
      providers: [StatusKanbanService],
    }).compile();

    controller = module.get<StatusKanbanController>(StatusKanbanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
