import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dtos/create-asset.dto';
import { UpdateAssetDto } from './dtos/update-asset.dto';
import { AssetEntity } from './entities/asset.entity';
import { AssignAssetDto } from './dtos/assign-asset.dto';
import { AssetAssignmentEntity } from './entities/asset-assignment.entity';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) { }

  @Post()
  create(@Body() dto: CreateAssetDto): Promise<AssetEntity> {
    return this.assetsService.create(dto);
  }

  @Get()
  findAll(): Promise<AssetEntity[]> {
    return this.assetsService.findAll();
  }

  @Get('user/:userId')
  getAssetsByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<AssetAssignmentEntity[]> {
    return this.assetsService.getAssetsByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AssetEntity> {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ): Promise<AssetEntity> {
    return this.assetsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ success: true }> {
    await this.assetsService.remove(id);
    return { success: true };
  }

  @Post(':id/assign')
  assignAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignAssetDto,
  ): Promise<AssetAssignmentEntity> {
    return this.assetsService.assignAsset(id, dto.userId);
  }

  @Patch(':id/unassign')
  unassignAsset(@Param('id', ParseUUIDPipe) id: string): Promise<AssetAssignmentEntity> {
    return this.assetsService.unassignAsset(id);
  }

  @Get(':id/history')
  getAssignmentHistory(@Param('id', ParseUUIDPipe) id: string): Promise<AssetAssignmentEntity[]> {
    return this.assetsService.getAssignmentHistory(id);
  }
}
