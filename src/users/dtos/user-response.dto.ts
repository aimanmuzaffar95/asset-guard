import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class UserResponseDto extends UserEntity {
  @ApiProperty({ example: 3 })
  activeAssignmentsCount: number;
}
