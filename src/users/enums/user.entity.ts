import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./user-roles.enum";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.STAFF })
    role: UserRole;
}