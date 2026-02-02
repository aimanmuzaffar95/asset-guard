import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetType } from '../enum/asset-type.enum';

export class CreateAssetDto {
  @IsEnum(AssetType)
  type: AssetType;

  @IsString()
  serialNumber: string;

  @IsOptional()
  @IsString()
  description?: string;
}
