import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';

@Entity('historico_status')
export class HistoricoStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrdemServico, (ordem) => ordem.historico)
  @JoinColumn({ name: 'id_ordem' })
  ordem: OrdemServico;

  @Column({ type: 'varchar', length: 255 })
  fromListTitle: string;

  @Column({ type: 'varchar', length: 255 })
  toListTitle: string;

  @Column({ name: 'id_funcionario_acao', type: 'int', nullable: true })
  idFuncionarioAcao: number;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}