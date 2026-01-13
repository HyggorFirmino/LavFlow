import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { OrdemServico } from './ordem-servico.entity';

import { ApiProperty } from '@nestjs/swagger';

@Entity('historico_status')
export class HistoricoStatus {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => OrdemServico })
  @ManyToOne(() => OrdemServico, (ordem) => ordem.historico)
  @JoinColumn({ name: 'id_ordem' })
  ordem: OrdemServico;

  @ApiProperty({ example: 'Lavando' })
  @Column({ type: 'varchar', length: 255 })
  fromListTitle: string;

  @ApiProperty({ example: 'Secando' })
  @Column({ type: 'varchar', length: 255 })
  toListTitle: string;

  @ApiProperty({ description: 'ID do usuário que realizou a ação', example: 3, required: false, nullable: true })
  @Column({ name: 'id_funcionario_acao', type: 'int', nullable: true })
  idFuncionarioAcao: number;

  @ApiProperty({ example: new Date().toISOString(), type: String })
  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}