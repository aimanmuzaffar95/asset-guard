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
import { AssetStatus } from '../enums/asset-status.enum';

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

  @ApiProperty({ example: 'MacBook Pro 16-inch' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ example: 'SN123456789' })
  @Column({ length: 100 })
  serialNumber: string;

  @ApiProperty({ example: 'Optional maintenance notes', required: false })
  @Column({ type: 'varchar', nullable: true, length: 1000 })
  notes?: string | null;

  @ApiProperty({ enum: AssetStatus, example: AssetStatus.AVAILABLE })
  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.AVAILABLE,
  })
  status: AssetStatus;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AssetAssignmentEntity, (assignment) => assignment.asset)
  assignments: AssetAssignmentEntity[];
}
