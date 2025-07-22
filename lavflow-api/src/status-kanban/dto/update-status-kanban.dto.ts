import { PartialType } from '@nestjs/swagger';
import { CreateStatusKanbanDto } from './create-status-kanban.dto';

export class UpdateStatusKanbanDto extends PartialType(CreateStatusKanbanDto) {}
