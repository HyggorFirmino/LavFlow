import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('logs')
export class Log {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'João da Silva' })
    @Column()
    customerName: string;

    @ApiProperty({ example: 'Lavadora #01' })
    @Column()
    machineName: string;

    @ApiProperty({ example: 'washer', enum: ['washer', 'dryer'] })
    @Column()
    machineType: string;

    @ApiProperty({ example: '123' })
    @Column()
    storeId: string;

    @ApiProperty({ example: new Date().toISOString() })
    @CreateDateColumn()
    timestamp: Date;
}
