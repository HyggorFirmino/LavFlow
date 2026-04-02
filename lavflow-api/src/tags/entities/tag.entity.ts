import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Store } from '../../stores/entities/store.entity';

@Entity('tags')
@Unique(['name', 'store'])
export class Tag {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Urgente' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ example: 'texto', enum: ['texto', 'número', 'valor'] })
  @Column({ type: 'varchar', length: 50 })
  type: 'texto' | 'número' | 'valor';

  @ApiProperty({ example: '#FF0000' })
  @Column({ type: 'varchar', length: 255 })
  color: string;

  @ApiProperty({ example: 15.5, description: 'Valor base para etiquetas do tipo valor', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseValue?: number;

  @ApiProperty({ description: 'Loja associada a esta etiqueta', type: () => Store })
  @ManyToOne(() => Store, { eager: true, nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;
}
