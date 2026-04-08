import { ApiProperty } from '@nestjs/swagger';
import { AssetStatus } from '../enums/asset-status.enum';

class AssetInventoryAssetTypeDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'laptop' })
  name: string;

  @ApiProperty({
    example: 'Portable computers',
    required: false,
    nullable: true,
  })
  description?: string | null;
}

export class AssetInventoryItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'MacBook Pro 16-inch' })
  name: string;

  @ApiProperty({ example: 'SN123456789' })
  serialNumber: string;

  @ApiProperty({ enum: AssetStatus, example: AssetStatus.AVAILABLE })
  status: AssetStatus;

  @ApiProperty({
    example: 'Optional maintenance notes',
    required: false,
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({ type: () => AssetInventoryAssetTypeDto })
  assetType: AssetInventoryAssetTypeDto;

  @ApiProperty({ example: 'John Doe', required: false, nullable: true })
  assignedTo: string | null;

  @ApiProperty({ example: '2026-04-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-02T00:00:00.000Z' })
  updatedAt: Date;
}
