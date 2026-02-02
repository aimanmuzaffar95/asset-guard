import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dtos/create-asset.dto';
import { UpdateAssetDto } from './dtos/update-asset.dto';
import { AssetEntity } from './entities/asset.entity';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() dto: CreateAssetDto): Promise<AssetEntity> {
    return this.assetsService.create(dto);
  }

  @Get()
  findAll(): Promise<AssetEntity[]> {
    return this.assetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AssetEntity> {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
  ): Promise<AssetEntity> {
    return this.assetsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    await this.assetsService.remove(id);
    return { success: true };
  }
}
