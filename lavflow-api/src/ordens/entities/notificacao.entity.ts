import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';

@Entity('notificacoes')
export class Notificacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tipo_notificacao', type: 'varchar', length: 50 })
  tipoNotificacao: string; // Ex: 'SMS', 'WhatsApp'

  @Column({ type: 'text' })
  mensagem: string;

  @Column({ name: 'status_envio', type: 'varchar', length: 50 })
  statusEnvio: string; // Ex: 'Enviado', 'Falhou'

  @CreateDateColumn({ name: 'data_envio' })
  dataEnvio: Date;

  // A ordem de serviço que originou esta notificação
  @ManyToOne(() => OrdemServico, (ordem) => ordem.notificacoes)
  @JoinColumn({ name: 'id_ordem' })
  ordem: OrdemServico;
}