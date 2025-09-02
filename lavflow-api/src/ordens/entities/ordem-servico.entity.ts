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
import { HistoricoStatus } from './historico-status.entity';

// O tipo de dado para o nosso campo JSON
interface CardTag {
  name: string;
  value?: string;
}

@Entity('ordens_servico')
export class OrdemServico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_name', type: 'varchar', length: 255 })
  customerName: string;

  @Column({ name: 'customer_document', type: 'varchar', length: 20, nullable: true })
  customerDocument: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'contact', type: 'varchar', length: 255 })
  contact: string;

  @Column({ name: 'service_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  serviceValue: number;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod: 'dinheiro' | 'pix';

  @Column({ type: 'jsonb', nullable: true })
  tags: CardTag[];

  @Column({ name: 'basket_identifier', type: 'varchar', length: 100, nullable: true })
  basketIdentifier: string;

  @Column({ name: 'notified_at', type: 'timestamp', nullable: true })
  notifiedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  services: { washing: boolean; drying: boolean };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;
  
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