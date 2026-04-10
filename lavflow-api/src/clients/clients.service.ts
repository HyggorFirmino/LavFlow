import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { OrdemServico } from '../ordens/entities/ordem-servico.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(OrdemServico)
    private ordensRepository: Repository<OrdemServico>,
  ) { }

  create(createClientDto: CreateClientDto) {
    const client = this.clientsRepository.create(createClientDto);
    return this.clientsRepository.save(client);
  }

  findAll(cpf?: string) {
    if (cpf) {
      return this.clientsRepository.find({ where: { cpf } });
    }
    return this.clientsRepository.find();
  }

  findOne(id: string) {
    return this.clientsRepository.findOne({ where: { id } });
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    // Regex para validar UUID (prevent 500 errors on invalid foreign IDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(`ID inválido: ${id}. Formato UUID esperado.`);
    }

    // Normalizar birthDate se for string vazia
    if (updateClientDto.birthDate === '') {
      updateClientDto.birthDate = null;
    }

    const client = await this.clientsRepository.preload({ id, ...updateClientDto });
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }
    return this.clientsRepository.save(client);
  }

  async remove(id: string) {
    // Verificar se o cliente possui ordens vinculadas
    const ordensCount = await this.ordensRepository.count({
      where: { client: { id } },
    });

    if (ordensCount > 0) {
      throw new BadRequestException(
        `Este cliente não pode ser removido pois possui ${ordensCount} ordem(ns) de serviço vinculada(s).`,
      );
    }

    const result = await this.clientsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }
  }
}
