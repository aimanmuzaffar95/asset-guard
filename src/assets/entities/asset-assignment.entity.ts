import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { AssetEntity } from './asset.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('asset_assignments')
@Index(['asset'], { where: '"returnedAt" IS NULL', unique: true })
export class AssetAssignmentEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @CreateDateColumn()
  assignedAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '2026-04-08T09:01:11.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date | null;

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, (user) => user.assignments)
  user: UserEntity;

  @ApiProperty({ type: () => AssetEntity })
  @ManyToOne(() => AssetEntity, (asset) => asset.assignments)
  asset: AssetEntity;
}
