// src/ordens/ordens.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdensService } from './ordens.service';
import { OrdensController } from './ordens.controller';
import { RastreioController } from './rastreio.controller';
import { OrdemServico } from './entities/ordem-servico.entity';
import { StatusKanban } from './entities/status-kanban.entity';
import { HistoricoStatus } from './entities/historico-status.entity';
import { Notificacao } from './entities/notificacao.entity';
import { Client } from 'src/clients/entities/client.entity';
import { UsersModule } from 'src/users/users.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    // ✅ ESTA LINHA É A SOLUÇÃO DO SEU PROBLEMA
    // Ela registra todas as entidades relacionadas a este módulo.
    // Ao fazer isso, o TypeORM disponibiliza o `Repository` de cada uma
    // para ser injetado no OrdensService.
    TypeOrmModule.forFeature([
      OrdemServico,
      StatusKanban,
      HistoricoStatus,
      Notificacao,
      Client,
    ]),
    UsersModule,
    RealtimeModule,
  ],
  controllers: [OrdensController, RastreioController],
  providers: [OrdensService],
})
export class OrdensModule { }