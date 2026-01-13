import { ApiProperty } from "@nestjs/swagger";
import { StatusKanban } from "src/ordens/entities/status-kanban.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, ManyToMany, OneToMany } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";

@Entity('stores')
export class Store {
    @ApiProperty({ description: 'ID da loja' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Nome da loja' })
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @ApiProperty({ description: 'Descrição da loja' })
    @Column({ type: 'varchar', length: 255 })
    description: string;

    @ApiProperty({ description: 'Endereço da loja' })
    @Column({ type: 'varchar', length: 255 })
    address: string;

    @ApiProperty({ description: 'Telefone da loja' })
    @Column({ type: 'varchar', length: 20 })
    phone: string;

    @Column({ type: 'varchar', length: 255 })
    @ManyToMany(() => User, (user) => user.stores)
    users: User[]

    @OneToMany(() => StatusKanban, (statusKanban) => statusKanban.store)
    statusKanban: StatusKanban[];
}
