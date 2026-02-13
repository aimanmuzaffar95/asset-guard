import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssetTypeDto {
  @ApiProperty({ example: 'laptop' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Portable computers', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
