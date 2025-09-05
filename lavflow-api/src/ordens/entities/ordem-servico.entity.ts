import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'João da Silva' })
  @Column({ name: 'customer_name', type: 'varchar', length: 255 })
  customerName: string;

  @ApiProperty({ example: '12345678900', required: false })
  @Column({ name: 'customer_document', type: 'varchar', length: 20, nullable: true })
  customerDocument: string;

  @ApiProperty({ example: 'Cliente preferencial', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ example: '(11) 99999-8888' })
  @Column({ name: 'contact', type: 'varchar', length: 255 })
  contact: string;

  @ApiProperty({ example: 120.5, required: false })
  @Column({ name: 'service_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  serviceValue: number;

  @ApiProperty({ example: 'pix', required: false })
  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod: 'dinheiro' | 'pix';

  @ApiProperty({
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'VIP' },
        value: { type: 'string', example: 'true' },
      },
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  tags: CardTag[];

  @ApiProperty({ example: 'cesta-abc', required: false })
  @Column({ name: 'basket_identifier', type: 'varchar', length: 100, nullable: true })
  basketIdentifier: string;

  @ApiProperty({ example: new Date().toISOString(), required: false, type: String })
  @Column({ name: 'notified_at', type: 'timestamp', nullable: true })
  notifiedAt: Date;

  @ApiProperty({
    required: false,
    type: Object,
    example: { washing: true, drying: false },
    additionalProperties: { type: 'boolean' },
  })
  @Column({ type: 'jsonb', nullable: true })
  services: { washing: boolean; drying: boolean };

  @ApiProperty({ example: new Date().toISOString(), type: String })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: new Date().toISOString(), required: false, type: String })
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;
  
  // --- RELACIONAMENTOS ---

  @ApiProperty({ type: () => StatusKanban })
  @ManyToOne(() => StatusKanban, (status) => status.ordens, { eager: true })
  @JoinColumn({ name: 'id_status' })
  status: StatusKanban;

  @ApiProperty({ type: () => Funcionario, required: false })
  @ManyToOne(() => Funcionario, (func) => func.ordensResponsavel, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_funcionario_responsavel' })
  funcionarioResponsavel: Funcionario;
  
  @ApiProperty({ type: () => [Notificacao] })
  @OneToMany(() => Notificacao, (notificacao) => notificacao.ordem)
  notificacoes: Notificacao[];

  @ApiProperty({ type: () => [HistoricoStatus] })
  @OneToMany(() => HistoricoStatus, (historico) => historico.ordem)
  historico: HistoricoStatus[];
}