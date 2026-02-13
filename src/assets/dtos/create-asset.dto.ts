import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the asset type',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiProperty({ example: 'SN123456789' })
  @IsString()
  serialNumber: string;

  @ApiProperty({ example: 'Macbook Pro M2', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
