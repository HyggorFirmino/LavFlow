import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';

@Entity('status_kanban')
export class StatusKanban {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  titulo: string;

  @Column({ type: 'int' })
  ordem: number;

  @Column({ name: 'limite_cartoes', type: 'int', nullable: true })
  limiteCartoes: number | null;

  @Column({ type: 'varchar', length: 50, default: 'default' })
  tipo: 'default' | 'dryer' | 'lavadora';

  @Column({ name: 'tempo_secagem_total', type: 'int', nullable: true })
  tempoSecagemTotal: number | null;

  @Column({ name: 'intervalo_leitura', type: 'int', nullable: true })
  intervaloLeitura: number | null;

  @OneToMany(() => OrdemServico, (ordem) => ordem.status)
  ordens: OrdemServico[];
}