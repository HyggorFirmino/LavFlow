import { ApiProperty } from "@nestjs/swagger";
import { StatusKanban } from "src/ordens/entities/status-kanban.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";

@Entity('stores')
export class Store {
    @ApiProperty({ description: 'ID da loja', example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Nome da loja', example: 'Empatiya Lavanderia Central' })
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @ApiProperty({ description: 'Descrição da loja', example: 'Matriz da rede Empatiya Lavanderia' })
    @Column({ type: 'varchar', length: 255 })
    description: string;

    @ApiProperty({ description: 'Endereço da loja', example: 'Rua das Flores, 123' })
    @Column({ type: 'varchar', length: 255 })
    address: string;

    @ApiProperty({ description: 'Telefone da loja', example: '(11) 99999-9999' })
    @Column({ type: 'varchar', length: 20 })
    phone: string;

    @ApiProperty({ description: 'Horário de funcionamento', example: 'Seg-Sex 08:00 - 18:00' })
    @Column({ type: 'varchar', length: 100, nullable: true })
    operatingHours: string;

    @ApiProperty({ description: 'CNPJ da loja', example: '00.000.000/0000-00' })
    @Column({ type: 'varchar', length: 20, nullable: true })
    cnpj: string;

    @ApiProperty({ description: 'Preço da lavagem', example: 20.00 })
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    washingPrice: number;

    @ApiProperty({ description: 'Preço da secagem', example: 20.00 })
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    dryingPrice: number;

    @ApiProperty({ description: 'Preço do combo (Lavagem + Secagem)', example: 35.00 })
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    comboPrice: number;

    @ApiProperty({ description: 'ID da loja externa (Maxpan)', example: 'STORE-123' })
    @Column({ type: 'varchar', length: 50, nullable: true })
    maxpanId: string;

    @ManyToMany(() => User, (user) => user.stores)
    @JoinTable()
    users: User[]

    @OneToMany(() => StatusKanban, (statusKanban) => statusKanban.store)
    statusKanban: StatusKanban[];
}
