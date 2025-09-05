import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrdemServico } from './ordem-servico.entity';

@Entity('status_kanban')
export class StatusKanban {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Lavando' })
  @Column({ type: 'varchar', length: 100 })
  titulo: string;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int' })
  ordem: number;

  @ApiProperty({ example: 10, required: false, nullable: true })
  @Column({ name: 'limite_cartoes', type: 'int', nullable: true })
  limiteCartoes: number | null;

  @ApiProperty({ example: 'default', enum: ['default', 'dryer', 'lavadora'] })
  @Column({ type: 'varchar', length: 50, default: 'default' })
  tipo: 'default' | 'dryer' | 'lavadora';

  @ApiProperty({ example: 3600, required: false, nullable: true })
  @Column({ name: 'tempo_secagem_total', type: 'int', nullable: true })
  tempoSecagemTotal: number | null;

  @ApiProperty({ example: 300, required: false, nullable: true })
  @Column({ name: 'intervalo_leitura', type: 'int', nullable: true })
  intervaloLeitura: number | null;

  @ApiProperty({ type: () => [OrdemServico] })
  @OneToMany(() => OrdemServico, (ordem) => ordem.status)
  ordens: OrdemServico[];
}