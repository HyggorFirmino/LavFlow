import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly realtimeService: RealtimeService,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name, store: { id: createTagDto.storeId } }
    });
    if (existingTag) {
      throw new ConflictException(`A etiqueta com o nome '${createTagDto.name}' já existe nesta loja.`);
    }
    const tag = this.tagRepository.create({
      ...createTagDto,
      store: { id: createTagDto.storeId }
    });
    const saved = await this.tagRepository.save(tag);

    if (createTagDto.storeId) {
      this.realtimeService.emit(createTagDto.storeId, 'tags_changed');
    }

    return saved;
  }

  findAll(storeId?: number): Promise<Tag[]> {
    if (storeId) {
       return this.tagRepository.find({ where: { store: { id: storeId } } });
    }
    return this.tagRepository.find();
  }

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOneBy({ id });
    if (!tag) {
      throw new NotFoundException(`Etiqueta com ID ${id} não encontrada.`);
    }
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepository.preload({ id, ...updateTagDto });
    if (!tag) {
      throw new NotFoundException(`Etiqueta com ID ${id} não encontrada.`);
    }
    const saved = await this.tagRepository.save(tag);

    const tagWithStore = await this.tagRepository.findOne({
      where: { id: saved.id },
      relations: ['store']
    });
    if (tagWithStore?.store?.id) {
      this.realtimeService.emit(tagWithStore.store.id, 'tags_changed');
    }

    return saved;
  }

  async remove(id: number): Promise<void> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['store']
    });
    const storeId = tag?.store?.id;

    const result = await this.tagRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Etiqueta com ID ${id} não encontrada.`);
    }

    if (storeId) {
      this.realtimeService.emit(storeId, 'tags_changed');
    }
  }
}
