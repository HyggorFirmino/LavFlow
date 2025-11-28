import { StatusKanban } from "src/ordens/entities/status-kanban.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, ManyToMany, OneToMany } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";

@Entity('stores')
export class Store {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    description: string;

    @Column({ type: 'varchar', length: 255 })
    address: string;

    @Column({ type: 'varchar', length: 20 })
    phone: string;

    @Column({ type: 'varchar', length: 255 })
    @ManyToMany(() => User, (user) => user.stores)
    users: User[]

    @OneToMany(() => StatusKanban, (statusKanban) => statusKanban.store)
    statusKanban: StatusKanban[];
}
