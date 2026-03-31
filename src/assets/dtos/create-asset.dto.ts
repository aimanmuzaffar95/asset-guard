import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateAssetDto {
  @ApiProperty({
    example: 'MacBook Pro 16-inch',
    description: 'Display name for the asset',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the asset type',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiProperty({ example: 'SN123456789' })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  serialNumber: string;

  @ApiProperty({ example: 'Optional maintenance notes', required: false })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
