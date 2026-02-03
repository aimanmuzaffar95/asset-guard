import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";
import { AssetEntity } from "./asset.entity";

@Entity('asset_assignments')
@Index(['asset'], { where: '"returnedAt" IS NULL', unique: true })
export class AssetAssignmentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    assignedAt: Date;

    @Column({ nullable: true })
    returnedAt: Date;

    @ManyToOne(() => UserEntity, user => user.assignments)
    user: UserEntity;

    @ManyToOne(() => AssetEntity, asset => asset.assignments)
    asset: AssetEntity;
}
