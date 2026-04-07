import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StatusKanban } from '../ordens/entities/status-kanban.entity';
import { Tag } from '../tags/entities/tag.entity';
import { OrdemServico } from '../ordens/entities/ordem-servico.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StatusKanban)
    private readonly statusRepository: Repository<StatusKanban>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(OrdemServico)
    private readonly ordensRepository: Repository<OrdemServico>,
  ) { }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepository.create(createStoreDto);
    return this.storeRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find();
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Loja com ID ${id} não encontrada`);
    }
    return store;
  }

  async findByCnpj(cnpj: string): Promise<Store | null> {
    const store = await this.storeRepository.findOne({ where: { cnpj } });
    return store || null;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.storeRepository.preload({
      id: id,
      ...updateStoreDto,
    });
    if (!store) {
      throw new NotFoundException(`Loja com ID ${id} não encontrada`);
    }
    return this.storeRepository.save(store);
  }

  async remove(id: number): Promise<void> {
    // Verificar se há status vinculados
    const statusCount = await this.statusRepository.count({
      where: { store: { id } },
    });
    if (statusCount > 0) {
      throw new BadRequestException(
        `Esta loja não pode ser removida pois possui ${statusCount} status de Kanban vinculados.`,
      );
    }

    // Verificar se há etiquetas vinculadas
    const tagsCount = await this.tagRepository.count({
      where: { store: { id } },
    });
    if (tagsCount > 0) {
      throw new BadRequestException(
        `Esta loja não pode ser removida pois possui ${tagsCount} etiquetas vinculadas.`,
      );
    }

    // Verificar se há ordens vinculadas (opcional, já que ordens dependem de status que dependem de loja)
    // Mas é bom para segurança extra
    const ordensCount = await this.ordensRepository.count({
      where: { status: { store: { id } } },
    });
    if (ordensCount > 0) {
      throw new BadRequestException(
        `Esta loja não pode ser removida pois possui ${ordensCount} ordens de serviço vinculadas em seus fluxos.`,
      );
    }

    const result = await this.storeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Loja com ID ${id} não encontrada`);
    }
  }
}
