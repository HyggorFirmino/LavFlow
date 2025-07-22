import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funcionario } from './entities/funcionario.entity';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Injectable()
export class FuncionariosService {
  constructor(
    @InjectRepository(Funcionario)
    private readonly funcionarioRepository: Repository<Funcionario>,
  ) {}

  create(createFuncionarioDto: CreateFuncionarioDto): Promise<Funcionario> {
    const funcionario = this.funcionarioRepository.create(createFuncionarioDto);
    return this.funcionarioRepository.save(funcionario);
  }

  findAll(): Promise<Funcionario[]> {
    return this.funcionarioRepository.find();
  }

  async findOne(id: number): Promise<Funcionario> {
    const funcionario = await this.funcionarioRepository.findOneBy({ id });
    if (!funcionario) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado.`);
    }
    return funcionario;
  }

  async update(id: number, updateFuncionarioDto: UpdateFuncionarioDto): Promise<Funcionario> {
    const funcionario = await this.funcionarioRepository.preload({
      id: id,
      ...updateFuncionarioDto,
    });
    if (!funcionario) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado.`);
    }
    return this.funcionarioRepository.save(funcionario);
  }

  async remove(id: number): Promise<void> {
    const result = await this.funcionarioRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado.`);
    }
  }
}