import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { OrdensService } from './ordens.service';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusKanban } from './entities/status-kanban.entity';
import { Repository } from 'typeorm';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('rastreio')
@Controller('api/pedidos/rastreio')
export class RastreioController {
  constructor(
    private readonly ordensService: OrdensService,
    @InjectRepository(StatusKanban)
    private readonly statusKanbanRepository: Repository<StatusKanban>,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtém informações públicas de rastreio de um pedido' })
  @ApiResponse({ status: 200, description: 'Dados de rastreio retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  async getRastreio(@Param('id', ParseIntPipe) id: number) {
    const ordem = await this.ordensService.findOne(id);
    if (!ordem) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
    }

    // Obter todos os status da loja desse pedido para montar a linha do tempo dinâmica
    let statuses: StatusKanban[] = [];
    if (ordem.status?.store?.id) {
      statuses = await this.statusKanbanRepository.find({
        where: { store: { id: ordem.status.store.id } },
        order: { ordem: 'ASC' },
      });
    } else {
      // Fallback: se por algum motivo não houver loja, trazer todos os status
      statuses = await this.statusKanbanRepository.find({
        order: { ordem: 'ASC' },
      });
    }

    // Ofuscar nome do cliente para fins de privacidade (Ex: "João da Silva" -> "João S.")
    const rawName = ordem.client?.name || 'Cliente';
    const parts = rawName.trim().split(/\s+/);
    const obfuscatedName = parts.length > 1 
      ? `${parts[0]} ${parts[parts.length - 1][0]}.` 
      : parts[0];

    return {
      id: ordem.id,
      customerName: obfuscatedName,
      createdAt: ordem.createdAt,
      completedAt: ordem.completedAt,
      enteredDryerAt: ordem.enteredDryerAt,
      basketIdentifier: ordem.basketIdentifier,
      numeroCesto: ordem.numeroCesto,
      services: ordem.services || { washing: false, drying: false },
      tags: (ordem.tags || []).map(t => ({ name: t.name, value: t.value })),
      status: {
        id: ordem.status.id,
        titulo: ordem.status.titulo,
        tipo: ordem.status.tipo,
        ordem: ordem.status.ordem,
      },
      timeline: statuses.map(s => ({
        id: s.id,
        titulo: s.titulo,
        tipo: s.tipo,
        ordem: s.ordem,
      })),
      history: (ordem.historico || []).map(h => ({
        timestamp: h.timestamp,
        fromListTitle: h.fromListTitle,
        toListTitle: h.toListTitle,
      })),
    };
  }
}
