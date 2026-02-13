import { Body, Controller, Get, Post } from '@nestjs/common';
import { AssetTypesService } from './asset-types.service';
import { CreateAssetTypeDto } from './dtos/create-asset-type.dto';
import { Admin } from '../auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssetTypeEntity } from './entities/asset-type.entity';

@ApiTags('Asset Types')
@ApiBearerAuth()
@Controller('asset-types')
export class AssetTypesController {
  constructor(private readonly assetTypesService: AssetTypesService) {}

  @Post()
  @Admin()
  @ApiOperation({ summary: 'Create a new asset type (Admin only)' })
  @ApiResponse({ status: 201, type: AssetTypeEntity })
  create(@Body() dto: CreateAssetTypeDto): Promise<AssetTypeEntity> {
    return this.assetTypesService.create(dto);
  }

  @Get()
  @Admin()
  @ApiOperation({ summary: 'Get all asset types' })
  @ApiResponse({ status: 200, type: [AssetTypeEntity] })
  findAll(): Promise<AssetTypeEntity[]> {
    return this.assetTypesService.findAll();
  }
}
