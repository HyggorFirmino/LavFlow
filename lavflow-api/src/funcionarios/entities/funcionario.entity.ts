import { OrdemServico } from '../../ordens/entities/ordem-servico.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('funcionarios')
export class Funcionario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 100 })
  cargo: string;

  // Relação: Um funcionário pode ser responsável por várias ordens
  @OneToMany(() => OrdemServico, (ordem) => ordem.funcionarioResponsavel)
  ordensResponsavel: OrdemServico[];
}