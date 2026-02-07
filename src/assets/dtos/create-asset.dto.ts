import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetType } from '../enum/asset-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ enum: AssetType })
  @IsEnum(AssetType)
  type: AssetType;

  @ApiProperty({ example: 'SN123456789' })
  @IsString()
  serialNumber: string;

  @ApiProperty({ example: 'Macbook Pro M2', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
