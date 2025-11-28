import { Store } from "src/stores/entities/store.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;
    @Column({ type: 'varchar', length: 255 })
    password: string;

    @ManyToMany(() => Store, (store) => store.users)
    stores: Store[];
}
