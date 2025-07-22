import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusKanban } from './status-kanban.entity';
import { Funcionario } from '../../funcionarios/entities/funcionario.entity';
import { Notificacao } from './notificacao.entity';
// Make sure the file exists at the specified path, or update the path if needed
import { HistoricoStatus } from './historico-status.entity';

// O tipo de dado para o nosso campo JSON
interface DadosDestaque {
  [key: string]: string;
}

@Entity('ordens_servico')
export class OrdemServico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_ordem', type: 'varchar', length: 50, unique: true })
  codigoOrdem: string;

  @Column({ name: 'titulo_ordem', type: 'varchar', length: 255 })
  tituloOrdem: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'contato_cliente', type: 'varchar', length: 255 })
  contatoCliente: string;

  @Column({ name: 'valor_total', type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ name: 'status_pagamento', type: 'varchar', length: 50 })
  statusPagamento: string;

  // Coluna especial que armazena dados flexíveis em formato JSON
  @Column({ type: 'jsonb', name: 'dados_destaque', nullable: true })
  dadosDestaque: DadosDestaque;

  // Coluna que registra a data de criação automaticamente
  @CreateDateColumn({ name: 'data_criacao' })
  dataCriacao: Date;

  @Column({ name: 'data_prevista_conclusao', type: 'timestamp', nullable: true })
  dataPrevistaConclusao: Date;
  
  // --- RELACIONAMENTOS ---

  @ManyToOne(() => StatusKanban, (status) => status.ordens, { eager: true }) // eager: true carrega o status junto com a ordem
  @JoinColumn({ name: 'id_status' }) // Especifica qual coluna no DB armazena a chave estrangeira
  status: StatusKanban;

  @ManyToOne(() => Funcionario, (func) => func.ordensResponsavel, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_funcionario_responsavel' })
  funcionarioResponsavel: Funcionario;
  
  @OneToMany(() => Notificacao, (notificacao) => notificacao.ordem)
  notificacoes: Notificacao[];

  @OneToMany(() => HistoricoStatus, (historico) => historico.ordem)
  historico: HistoricoStatus[];
}