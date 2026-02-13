import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AssetEntity } from '../../assets/entities/asset.entity';
import { Exclude } from 'class-transformer';

@Entity('asset_types')
export class AssetTypeEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'laptop' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'Portable computers', required: false })
  @Column({ nullable: true })
  description?: string;

  @Exclude()
  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AssetEntity, (asset) => asset.assetType)
  assets: AssetEntity[];
}
