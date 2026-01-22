import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusKanbanService } from './status-kanban.service';
import { StatusKanbanController } from './status-kanban.controller';
import { StatusKanban } from '../ordens/entities/status-kanban.entity';
import { OrdemServico } from '../ordens/entities/ordem-servico.entity';
import { Store } from '../stores/entities/store.entity';

@Module({
  imports: [
    // Registramos StatusKanban e OrdemServico aqui
    TypeOrmModule.forFeature([StatusKanban, OrdemServico, Store]),
  ],
  controllers: [StatusKanbanController],
  providers: [StatusKanbanService],
})
export class StatusKanbanModule { }