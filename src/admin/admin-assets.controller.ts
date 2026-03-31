import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Admin } from '../auth/decorators/roles.decorator';
import { AssetsService } from '../assets/assets.service';
import { CreateAssetDto } from '../assets/dtos/create-asset.dto';
import { AssetEntity } from '../assets/entities/asset.entity';

@ApiTags('Admin Assets')
@ApiBearerAuth()
@Controller('admin/assets')
export class AdminAssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @ApiOperation({ summary: 'Create a new asset for the admin inventory flow' })
  @ApiResponse({ status: 201, type: AssetEntity })
  @Admin()
  @Post()
  create(@Body() dto: CreateAssetDto): Promise<AssetEntity> {
    return this.assetsService.create(dto);
  }
}
