import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { AssetType } from "../enum/asset-type.enum";
import { AssetAssignmentEntity } from "./asset-assignment.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity('assets')
@Unique(['serialNumber'])
export class AssetEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: AssetType })
  @Column({
    type: 'enum',
    enum: AssetType,
  })
  type: AssetType;

  @ApiProperty({ example: 'SN123456789' })
  @Column()
  serialNumber: string;

  @ApiProperty({ example: 'Macbook Pro M2', required: false })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AssetAssignmentEntity, assignment => assignment.asset)
  assignments: AssetAssignmentEntity[];
}
