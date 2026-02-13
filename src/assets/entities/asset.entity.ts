import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { AssetAssignmentEntity } from './asset-assignment.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AssetTypeEntity } from '../../asset-types/entities/asset-type.entity';

@Entity('assets')
@Unique(['serialNumber'])
export class AssetEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => AssetTypeEntity })
  @ManyToOne(() => AssetTypeEntity, (assetType) => assetType.assets, {
    nullable: false,
  })
  @JoinColumn({ name: 'assetTypeId' })
  assetType: AssetTypeEntity;

  @Column({ name: 'assetTypeId' })
  assetTypeId: string;

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

  @OneToMany(() => AssetAssignmentEntity, (assignment) => assignment.asset)
  assignments: AssetAssignmentEntity[];
}
