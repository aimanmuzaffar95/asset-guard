import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-roles.enum';
import { Exclude } from 'class-transformer';
import { AssetAssignmentEntity } from '../../assets/entities/asset-assignment.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class UserEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @ApiProperty({ example: 'John' })
  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @ApiProperty({ enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STAFF,
  })
  role: UserRole;

  @OneToMany(() => AssetAssignmentEntity, (assignment) => assignment.user)
  assignments: AssetAssignmentEntity[];
}
