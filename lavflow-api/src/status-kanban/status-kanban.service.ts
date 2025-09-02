import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusKanban } from '../ordens/entities/status-kanban.entity';
import { CreateStatusKanbanDto } from './dto/create-status-kanban.dto';
import { UpdateStatusKanbanDto } from './dto/update-status-kanban.dto';
import { OrdemServico } from '../ordens/entities/ordem-servico.entity';

@Injectable()
export class StatusKanbanService {
  constructor(
    @InjectRepository(StatusKanban)
    private readonly statusRepository: Repository<StatusKanban>,
    // Injetamos o repositório de OrdemServico para verificar se um status está em uso
    @InjectRepository(OrdemServico)
    private readonly ordemRepository: Repository<OrdemServico>,
  ) {}

  create(createStatusDto: CreateStatusKanbanDto): Promise<StatusKanban> {
    const status = this.statusRepository.create(createStatusDto);
    return this.statusRepository.save(status);
  }

  // É crucial ordenar os status para que o Kanban seja exibido corretamente
  findAll(): Promise<StatusKanban[]> {
    return this.statusRepository.find({
      order: {
        ordem: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<StatusKanban> {
    const status = await this.statusRepository.findOneBy({ id });
    if (!status) {
      throw new NotFoundException(`Status com ID ${id} não encontrado.`);
    }
    return status;
  }

  async update(id: number, updateStatusDto: UpdateStatusKanbanDto): Promise<StatusKanban> {
    const status = await this.statusRepository.preload({ id, ...updateStatusDto });
    if (!status) {
      throw new NotFoundException(`Status com ID ${id} não encontrado.`);
    }
    return this.statusRepository.save(status);
  }

  async remove(id: number): Promise<void> {
    // REGRA DE NEGÓCIO IMPORTANTE: Não permitir exclusão se o status estiver em uso.
    const ordensComStatus = await this.ordemRepository.count({
      where: { status: { id } },
    });

    if (ordensComStatus > 0) {
      throw new BadRequestException(
        `Este status não pode ser removido pois está em uso por ${ordensComStatus} ordem(ns) de serviço.`,
      );
    }
    
    const result = await this.statusRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Status com ID ${id} não encontrado.`);
    }
  }
}