import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tags')
export class Tag {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Urgente' })
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @ApiProperty({ example: 'texto', enum: ['texto', 'número'] })
  @Column({ type: 'varchar', length: 50 })
  type: 'texto' | 'número';

  @ApiProperty({ example: '#FF0000' })
  @Column({ type: 'varchar', length: 255 })
  color: string;
}
