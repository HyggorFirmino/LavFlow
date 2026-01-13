import { Store } from "src/stores/entities/store.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../enums/user-role.enum";
import { OrdemServico } from "src/ordens/entities/ordem-servico.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity('users')
export class User {
    @ApiProperty({ description: 'ID do usuário' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Nome do usuário' })
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @ApiProperty({ description: 'Email do usuário' })
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @ApiProperty({ description: 'Senha do usuário' })
    @Column({ type: 'varchar', length: 255 })
    password: string;

    @ApiProperty({ enum: UserRole, description: 'Cargo ou função do usuário' })
    @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
    role: UserRole;

    @ManyToMany(() => Store, (store) => store.users)
    stores: Store[];

    @OneToMany(() => OrdemServico, (ordem) => ordem.funcionarioResponsavel)
    ordensResponsavel: OrdemServico[];
}
