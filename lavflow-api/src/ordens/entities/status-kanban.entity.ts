import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';

@Entity('status_kanban')
export class StatusKanban {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nome_status', type: 'varchar', length: 100 })
  nomeStatus: string;

  @Column({ name: 'ordem_exibicao', type: 'int' })
  ordemExibicao: number;

  // Relação: Um status pode ter várias ordens de serviço
  @OneToMany(() => OrdemServico, (ordem) => ordem.status)
  ordens: OrdemServico[];
}