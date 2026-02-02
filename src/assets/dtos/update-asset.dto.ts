import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetType } from '../enum/asset-type.enum';

export class UpdateAssetDto {
  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType;

  @IsOptional()
  @IsString()
  description?: string;
}
