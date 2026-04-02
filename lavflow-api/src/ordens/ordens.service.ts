import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrdemServico } from './entities/ordem-servico.entity';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { UpdateOrdemDto } from './dto/update-ordem.dto';
import { StatusKanban } from './entities/status-kanban.entity';
import { HistoricoStatus } from './entities/historico-status.entity';
import { MudarStatusOrdemDto } from './dto/mudar-status-ordem.dto';

import { User } from 'src/users/entities/user.entity';
import { Client } from 'src/clients/entities/client.entity';

@Injectable()
export class OrdensService {
  constructor(
    @InjectRepository(OrdemServico)
    private readonly ordemServicoRepository: Repository<OrdemServico>,

    @InjectRepository(StatusKanban)
    private readonly statusKanbanRepository: Repository<StatusKanban>,

    @InjectRepository(HistoricoStatus)
    private readonly historicoRepository: Repository<HistoricoStatus>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    private readonly dataSource: DataSource,
  ) { }

  async create(createOrdemDto: CreateOrdemDto): Promise<OrdemServico> {
    console.log('[CREATE ORDEM] Payload recebido:', JSON.stringify(createOrdemDto, null, 2));
    
    const { idStatusInicial, idFuncionarioResponsavel, clientId, clientDocument, storeId, ...dadosOrdem } = createOrdemDto;

    console.log('[CREATE ORDEM] Campos extraídos:', { idStatusInicial, idFuncionarioResponsavel, clientId, clientDocument, storeId });

    let statusInicial;

    if (idStatusInicial) {
      statusInicial = await this.statusKanbanRepository.findOneBy({ id: idStatusInicial });
      if (!statusInicial) {
        throw new NotFoundException(`Status com ID ${idStatusInicial} não encontrado.`);
      }
    } else if (storeId) {
      statusInicial = await this.statusKanbanRepository.findOne({
        where: {
          store: { id: storeId },
          ordem: 1
        }
      });

      if (!statusInicial) {
        throw new NotFoundException(`Não foi encontrado um status com ordem 1 para a loja ${storeId}.`);
      }
    } else {
      throw new NotFoundException('É necessário informar o status inicial ou a loja para criar a ordem.');
    }

    console.log('[CREATE ORDEM] Status inicial encontrado:', statusInicial?.id, statusInicial?.titulo);

    // Regex para validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let client: Client | null = null;
    if (clientId) {
      if (uuidRegex.test(clientId)) {
        // clientId é um UUID válido → buscar direto pelo ID
        client = await this.clientRepository.findOneBy({ id: clientId });
      } else {
        // clientId não é UUID (ex: ID MongoDB da Maxpan) → tentar buscar por CPF
        console.log(`[CREATE ORDEM] clientId "${clientId}" não é UUID. Tentando buscar por CPF...`);
        if (clientDocument) {
          const cpfLimpo = clientDocument.replace(/\D/g, '');
          client = await this.clientRepository.findOneBy({ cpf: cpfLimpo });
          console.log(`[CREATE ORDEM] Busca por CPF "${cpfLimpo}":`, client ? `encontrado (${client.id})` : 'não encontrado');
        }
      }
    } else if (clientDocument) {
      // Sem clientId mas com CPF → buscar por CPF
      const cpfLimpo = clientDocument.replace(/\D/g, '');
      client = await this.clientRepository.findOneBy({ cpf: cpfLimpo });
    }

    console.log('[CREATE ORDEM] Client:', client ? client.id : 'null (sem cliente vinculado)');

    try {
      const novaOrdem = this.ordemServicoRepository.create({
        ...dadosOrdem,
        status: statusInicial,
        ...(client ? { client } : {}),
      });

      if (idFuncionarioResponsavel) {
        novaOrdem.funcionarioResponsavel = { id: idFuncionarioResponsavel } as User;
      }

      console.log('[CREATE ORDEM] Salvando ordem...');
      const ordemSalva = await this.ordemServicoRepository.save(novaOrdem);
      console.log('[CREATE ORDEM] Ordem salva com ID:', ordemSalva.id);

      const historico = this.historicoRepository.create({
        ordem: ordemSalva,
        fromListTitle: '',
        toListTitle: statusInicial.titulo,
        idFuncionarioAcao: idFuncionarioResponsavel,
      });
      await this.historicoRepository.save(historico);

      return ordemSalva;
    } catch (error) {
      console.error('[CREATE ORDEM] ❌ ERRO ao salvar:', error.message);
      console.error('[CREATE ORDEM] ❌ Stack:', error.stack);
      console.error('[CREATE ORDEM] ❌ Detalhes:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw error;
    }
  }

  async findAll(): Promise<OrdemServico[]> {
    const ordens = await this.ordemServicoRepository.find({
      relations: ['historico'],
    });

    // Debug: verificar se enteredDryerAt está sendo carregado
    ordens.forEach(ordem => {
      if (ordem.status?.tipo === 'dryer') {
        console.log('[BACKEND DEBUG] Ordem in dryer:', {
          id: ordem.id,
          statusTipo: ordem.status.tipo,
          enteredDryerAt: ordem.enteredDryerAt,
          hasField: 'enteredDryerAt' in ordem
        });
      }
    });

    return ordens;
  }

  async findOne(id: number): Promise<OrdemServico> {
    const ordem = await this.ordemServicoRepository.findOne({
      where: { id },
      relations: ['historico'],
    });
    if (!ordem) {
      throw new NotFoundException(`Ordem com ID ${id} não encontrada.`);
    }
    return ordem;
  }

  async update(id: number, updateOrdemDto: UpdateOrdemDto): Promise<OrdemServico> {
    const ordem = await this.ordemServicoRepository.findOneBy({ id });
    if (!ordem) {
      throw new NotFoundException(`Ordem com ID ${id} não encontrada.`);
    }

    // Se houver atualização de cliente
    if (updateOrdemDto.clientId) {
      const client = await this.clientRepository.findOneBy({ id: updateOrdemDto.clientId });
      if (!client) {
        throw new NotFoundException(`Cliente com ID ${updateOrdemDto.clientId} não encontrado.`);
      }
      ordem.client = client;
    }

    // Se houver atualização de responsável
    if (updateOrdemDto.idFuncionarioResponsavel) {
      ordem.funcionarioResponsavel = { id: updateOrdemDto.idFuncionarioResponsavel } as User;
    }

    // Merge dos outros dados
    // Ignoramos idStatusInicial pois status deve ser mudado via 'mudarStatus' ou logica com historico
    // Mas se quiser permitir mudar status por aqui sem historico (edit simples), pode. 
    // Por enquanto, vamos ignorar idStatusInicial no update generico para evitar inconsistencia de historico
    // ou tratar se for diferente.
    // O ideal é usar 'mudarStatus' para trocas de coluna.
    const { idStatusInicial, clientId, idFuncionarioResponsavel, ...dadosAtualizaveis } = updateOrdemDto;

    this.ordemServicoRepository.merge(ordem, dadosAtualizaveis);

    return this.ordemServicoRepository.save(ordem);
  }

  async mudarStatus(id: number, mudarStatusDto: MudarStatusOrdemDto): Promise<OrdemServico> {
    const { novoStatusId, idFuncionarioAcao } = mudarStatusDto;

    return this.dataSource.transaction(async (manager) => {
      const ordemRepo = manager.getRepository(OrdemServico);
      const historicoRepo = manager.getRepository(HistoricoStatus);
      const statusRepo = manager.getRepository(StatusKanban);

      const ordem = await ordemRepo.findOne({ where: { id }, relations: ['status'] });
      if (!ordem) throw new NotFoundException(`Ordem com ID ${id} não encontrada.`);

      const novoStatus = await statusRepo.findOneBy({ id: novoStatusId });
      if (!novoStatus) throw new NotFoundException(`Status com ID ${novoStatusId} não encontrado.`);

      const statusAntigoTitulo = ordem.status.titulo;

      // Check for type 'dryer'
      if (novoStatus.tipo === 'dryer') {
        ordem.enteredDryerAt = new Date();
      } else {
        ordem.enteredDryerAt = null;
      }

      ordem.status = novoStatus;
      await ordemRepo.save(ordem);

      const historico = historicoRepo.create({
        ordem,
        fromListTitle: statusAntigoTitulo,
        toListTitle: novoStatus.titulo,
        idFuncionarioAcao: idFuncionarioAcao,
      });
      await historicoRepo.save(historico);

      return ordem;
    });
  }
}