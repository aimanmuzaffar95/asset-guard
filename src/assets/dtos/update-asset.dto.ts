import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetType } from '../enum/asset-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAssetDto {
  @ApiProperty({ enum: AssetType, required: false })
  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
