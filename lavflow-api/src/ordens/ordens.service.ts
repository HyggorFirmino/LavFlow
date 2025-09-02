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
  constructor(
    @InjectRepository(OrdemServico)
    private readonly ordemServicoRepository: Repository<OrdemServico>,

    @InjectRepository(StatusKanban)
    private readonly statusKanbanRepository: Repository<StatusKanban>,
    
    @InjectRepository(HistoricoStatus)
    private readonly historicoRepository: Repository<HistoricoStatus>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createOrdemDto: CreateOrdemDto): Promise<OrdemServico> {
    const { idStatusInicial, idFuncionarioResponsavel, ...dadosOrdem } = createOrdemDto;

    const statusInicial = await this.statusKanbanRepository.findOneBy({ id: idStatusInicial });
    if (!statusInicial) {
      throw new NotFoundException(`Status com ID ${idStatusInicial} não encontrado.`);
    }

    const novaOrdem = this.ordemServicoRepository.create({
      ...dadosOrdem,
      status: statusInicial,
    });
    
    if(idFuncionarioResponsavel) {
      novaOrdem.funcionarioResponsavel = { id: idFuncionarioResponsavel } as Funcionario;
    }

    const ordemSalva = await this.ordemServicoRepository.save(novaOrdem);

    const historico = this.historicoRepository.create({
      ordem: ordemSalva,
      fromListTitle: '',
      toListTitle: statusInicial.titulo,
      idFuncionarioAcao: idFuncionarioResponsavel,
    });
    await this.historicoRepository.save(historico);

    return ordemSalva;
  }

  findAll(): Promise<OrdemServico[]> {
    return this.ordemServicoRepository.find();
  }

  async findOne(id: number): Promise<OrdemServico> {
    const ordem = await this.ordemServicoRepository.findOneBy({ id });
    if (!ordem) {
      throw new NotFoundException(`Ordem com ID ${id} não encontrada.`);
    }
    return ordem;
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