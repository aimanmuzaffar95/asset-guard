import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { AssetType } from "../enum/asset-type.enum";
import { AssetAssignmentEntity } from "./asset-assignment.entity";

@Entity('assets')
@Unique(['serialNumber'])
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AssetType,
  })
  type: AssetType;

  @Column()
  serialNumber: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AssetAssignmentEntity, assignment => assignment.asset)
  assignments: AssetAssignmentEntity[];
}

