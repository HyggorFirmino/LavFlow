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
import { User } from '../../users/entities/user.entity';
import { Notificacao } from './notificacao.entity';
import { HistoricoStatus } from './historico-status.entity';
import { Client } from 'src/clients/entities/client.entity';

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





  @ApiProperty({ example: 'Cliente preferencial', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ example: 'Cliente prefere entrega à tarde', required: false })
  @Column({ name: 'client_notes', type: 'text', nullable: true })
  clientNotes: string;



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

  @ApiProperty({ example: 5, required: false })
  @Column({ name: 'numero_cesto', type: 'int', nullable: true })
  numeroCesto: number;

  @ApiProperty({ example: new Date().toISOString(), required: false, type: String })
  @Column({ name: 'notified_at', type: 'timestamp', nullable: true })
  notifiedAt: Date;

  @ApiProperty({ example: new Date().toISOString(), required: false, type: String })
  @Column({ name: 'entered_dryer_at', type: 'timestamp', nullable: true })
  enteredDryerAt: Date | null;

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

  @ApiProperty({ type: () => Client })
  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'id_cliente' })
  client: Client;

  @ApiProperty({ type: () => User, required: false })
  @ManyToOne(() => User, (user) => user.ordensResponsavel, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_funcionario_responsavel' }) // Manter mesmo nome de coluna ou migrar? Manter por enquanto para facilitar
  funcionarioResponsavel: User;

  @ApiProperty({ type: () => [Notificacao] })
  @OneToMany(() => Notificacao, (notificacao) => notificacao.ordem)
  notificacoes: Notificacao[];

  @ApiProperty({ type: () => [HistoricoStatus] })
  @OneToMany(() => HistoricoStatus, (historico) => historico.ordem)
  historico: HistoricoStatus[];
}