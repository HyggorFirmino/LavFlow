import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrdemServico } from './ordem-servico.entity';

@Entity('notificacoes')
export class Notificacao {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'SMS' })
  @Column({ name: 'tipo_notificacao', type: 'varchar', length: 50 })
  tipoNotificacao: string; // Ex: 'SMS', 'WhatsApp'

  @ApiProperty({ example: 'Seu pedido está pronto.' })
  @Column({ type: 'text' })
  mensagem: string;

  @ApiProperty({ example: 'Enviado' })
  @Column({ name: 'status_envio', type: 'varchar', length: 50 })
  statusEnvio: string; // Ex: 'Enviado', 'Falhou'

  @ApiProperty({ example: new Date().toISOString(), type: String })
  @CreateDateColumn({ name: 'data_envio' })
  dataEnvio: Date;

  @ApiProperty({ type: () => OrdemServico })
  @ManyToOne(() => OrdemServico, (ordem) => ordem.notificacoes)
  @JoinColumn({ name: 'id_ordem' })
  ordem: OrdemServico;
}