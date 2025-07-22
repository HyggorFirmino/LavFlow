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

  // A ordem de serviço à qual este registro de histórico pertence
  @ManyToOne(() => OrdemServico, (ordem) => ordem.historico)
  @JoinColumn({ name: 'id_ordem' })
  ordem: OrdemServico;

  @Column({ name: 'id_status_anterior', type: 'int', nullable: true })
  idStatusAnterior: number;

  @Column({ name: 'id_status_novo', type: 'int' })
  idStatusNovo: number;

  @Column({ name: 'id_funcionario_acao', type: 'int', nullable: true })
  idFuncionarioAcao: number;
  
  @CreateDateColumn({ name: 'data_mudanca' })
  dataMudanca: Date;
}