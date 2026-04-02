import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
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
    return this.tagRepository.save(tag);
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
    return this.tagRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    const result = await this.tagRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Etiqueta com ID ${id} não encontrada.`);
    }
  }
}
