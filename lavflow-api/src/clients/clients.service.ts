import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
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
    return this.clientsRepository.update(id, updateClientDto);
  }

  async remove(id: string) {
    return this.clientsRepository.delete(id);
  }
}
