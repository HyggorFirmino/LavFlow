import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusKanban } from '../ordens/entities/status-kanban.entity';
import { Store } from '../stores/entities/store.entity';
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
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) { }

  async create(createStatusDto: CreateStatusKanbanDto): Promise<StatusKanban> {
    const { storeId, ...rest } = createStatusDto;
    const store = await this.storeRepository.findOneBy({ id: storeId });
    if (!store) {
      throw new NotFoundException(`Loja com ID ${storeId} não encontrada.`);
    }

    // Calcular a próxima ordem para esta loja
    const maxOrderResult = await this.statusRepository
      .createQueryBuilder('status')
      .select('MAX(status.ordem)', 'max')
      .where('status.storeId = :storeId', { storeId })
      .getRawOne();

    const nextOrder = (maxOrderResult?.max || 0) + 1;

    const status = this.statusRepository.create({
      ...rest,
      ordem: nextOrder,
      store: store
    });
    return this.statusRepository.save(status);
  }

  // É crucial ordenar os status para que o Kanban seja exibido corretamente
  findAll(): Promise<StatusKanban[]> {
    return this.statusRepository.find({
      relations: ['store'],
      order: {
        ordem: 'ASC',
      },
    });
  }

  findAllByStore(storeId: number): Promise<StatusKanban[]> {
    return this.statusRepository.find({
      where: { store: { id: storeId } },
      relations: ['store'], // Incluir a loja se necessário, ou remover se não for
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

  async reorder(storeId: number, orderedIds: number[]): Promise<void> {
    const store = await this.storeRepository.findOneBy({ id: storeId });
    if (!store) {
      throw new NotFoundException(`Loja com ID ${storeId} não encontrada.`);
    }

    // Validate that all IDs belong to the store to prevent cross-store tampering
    // Not strictly necessary if we just update by ID, but good for safety.
    // For performance, we'll just loop and update.
    // Use transaction for safety
    await this.statusRepository.manager.transaction(async (manager) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await manager.update(StatusKanban, { id: orderedIds[i], store: { id: storeId } }, { ordem: i + 1 });
      }
    });
  }
}