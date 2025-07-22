import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrdemServico } from './entities/ordem-servico.entity';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { StatusKanban } from './entities/status-kanban.entity';
import { HistoricoStatus } from './entities/historico-status.entity';
import { MudarStatusOrdemDto } from './dto/mudar-status-ordem.dto';
import { Funcionario } from 'src/funcionarios/entities/funcionario.entity';

@Injectable()
export class OrdensService {
  // Injetamos os repositórios para interagir com as tabelas do banco
  constructor(
    @InjectRepository(OrdemServico)
    private readonly ordemServicoRepository: Repository<OrdemServico>,

    @InjectRepository(StatusKanban)
    private readonly statusKanbanRepository: Repository<StatusKanban>,
    
    @InjectRepository(HistoricoStatus)
    private readonly historicoRepository: Repository<HistoricoStatus>,

    // O DataSource é necessário para criar transações
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrdemDto: CreateOrdemDto): Promise<OrdemServico> {
    const { idStatusInicial, idFuncionarioResponsavel, ...dadosOrdem } = createOrdemDto;

    // 1. Busca as entidades relacionadas (status e funcionário)
    const statusInicial = await this.statusKanbanRepository.findOneBy({ id: idStatusInicial });
    if (!statusInicial) {
      throw new NotFoundException(`Status com ID ${idStatusInicial} não encontrado.`);
    }

    // 2. Cria a nova instância da Ordem de Serviço
    const novaOrdem = this.ordemServicoRepository.create({
      ...dadosOrdem,
      status: statusInicial, // Associa o objeto de status completo
      codigoOrdem: `LAV-${Date.now()}`, // Lógica simples para um código único
      statusPagamento: 'Pendente',
    });
    
    // Associa o funcionário se o ID foi fornecido
    if(idFuncionarioResponsavel) {
      novaOrdem.funcionarioResponsavel = { id: idFuncionarioResponsavel } as Funcionario;
    }

    // 3. Salva a nova ordem e cria o registro de histórico
    const ordemSalva = await this.ordemServicoRepository.save(novaOrdem);

    const historico = this.historicoRepository.create({
      ordem: ordemSalva,
      idStatusNovo: idStatusInicial,
      idFuncionarioAcao: idFuncionarioResponsavel,
    });
    await this.historicoRepository.save(historico);

    return ordemSalva;
  }

  findAll(): Promise<OrdemServico[]> {
    // Retorna todas as ordens, já incluindo o status e funcionário (configurado com eager: true na entidade)
    return this.ordemServicoRepository.find();
  }

  async findOne(id: number): Promise<OrdemServico> {
    const ordem = await this.ordemServicoRepository.findOneBy({ id });
    if (!ordem) {
      throw new NotFoundException(`Ordem com ID ${id} não encontrada.`);
    }
    return ordem;
  }

  // A função mais importante para o Kanban: Mover um cartão
  async mudarStatus(id: number, mudarStatusDto: MudarStatusOrdemDto): Promise<OrdemServico> {
    const { novoStatusId, idFuncionarioAcao } = mudarStatusDto;

    // Usamos uma transação para garantir que ambas as operações (atualizar a ordem e criar o histórico)
    // aconteçam com sucesso. Se uma falhar, a outra é desfeita (rollback).
    return this.dataSource.transaction(async (manager) => {
      const ordemRepo = manager.getRepository(OrdemServico);
      const historicoRepo = manager.getRepository(HistoricoStatus);
      const statusRepo = manager.getRepository(StatusKanban);

      // 1. Busca a ordem e o novo status
      const ordem = await ordemRepo.findOne({ where: { id }, relations: ['status'] });
      if (!ordem) throw new NotFoundException(`Ordem com ID ${id} não encontrada.`);
      
      const novoStatus = await statusRepo.findOneBy({ id: novoStatusId });
      if (!novoStatus) throw new NotFoundException(`Status com ID ${novoStatusId} não encontrado.`);

      const statusAntigoId = ordem.status.id;

      // 2. Atualiza o status da ordem
      ordem.status = novoStatus;
      await ordemRepo.save(ordem);

      // 3. Cria o registro de histórico para a mudança
      const historico = historicoRepo.create({
        ordem,
        idStatusAnterior: statusAntigoId,
        idStatusNovo: novoStatusId,
        idFuncionarioAcao: idFuncionarioAcao,
      });
      await historicoRepo.save(historico);
      
      return ordem;
    });
  }
}