import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoresController } from './stores.controller';

import { StatusKanban } from '../ordens/entities/status-kanban.entity';
import { Tag } from '../tags/entities/tag.entity';
import { OrdemServico } from '../ordens/entities/ordem-servico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StatusKanban, Tag, OrdemServico])],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService] // Exporting just in case Users module needs it later
})
export class StoresModule { }
