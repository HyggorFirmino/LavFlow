import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('clients')
export class Client {
  @ApiProperty({ description: 'ID único do cliente', example: 'uuid-v4' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome completo do cliente', example: 'João da Silva' })
  @Column()
  name: string;

  @ApiProperty({ description: 'CPF do cliente', example: '123.456.789-00' })
  @Column({ unique: true })
  cpf: string;

  @ApiProperty({ description: 'Endereço completo', example: 'Rua das Flores, 123', required: false })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ description: 'Telefone', example: '(11) 98765-4321', required: false })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ description: 'Data de nascimento', example: '1990-01-01', required: false })
  @Column({ type: 'date', nullable: true })
  birthDate: string;

  @ApiProperty({ description: 'Data de criação' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn()
  updatedAt: Date;
}
