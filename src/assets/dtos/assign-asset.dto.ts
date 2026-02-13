import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignAssetDto {
  @ApiProperty({ description: 'ID of the user to assign the asset to' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
