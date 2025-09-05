import { OrdemServico } from '../../ordens/entities/ordem-servico.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('funcionarios')
export class Funcionario {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Maria Souza' })
  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @ApiProperty({ example: 'Gerente' })
  @Column({ type: 'varchar', length: 100 })
  cargo: string;

  @ApiProperty({ type: () => [OrdemServico], description: 'Ordens de serviço sob responsabilidade do funcionário' })
  @OneToMany(() => OrdemServico, (ordem) => ordem.funcionarioResponsavel)
  ordensResponsavel: OrdemServico[];
}