import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dtos/create-asset.dto';
import { UpdateAssetDto } from './dtos/update-asset.dto';
import { AssetEntity } from './entities/asset.entity';
import { AssignAssetDto } from './dtos/assign-asset.dto';
import { AssetAssignmentEntity } from './entities/asset-assignment.entity';
import { Admin, Staff } from '../auth/decorators/roles.decorator';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) { }

  @ApiOperation({ summary: 'Get assets assigned to the current user' })
  @ApiResponse({ status: 200, type: [AssetAssignmentEntity] })
  @Staff()
  @Get('me')
  async getMyAssets(@Req() req: any): Promise<AssetAssignmentEntity[]> {
    return this.assetsService.getAssetsByUser(req.user.sub);
  }

  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ status: 201, type: AssetEntity })
  @Admin()
  @Post()
  create(@Body() dto: CreateAssetDto): Promise<AssetEntity> {
    return this.assetsService.create(dto);
  }

  @ApiOperation({ summary: 'List all assets' })
  @ApiResponse({ status: 200, type: [AssetEntity] })
  @Admin()
  @Get()
  findAll(): Promise<AssetEntity[]> {
    return this.assetsService.findAll();
  }

  @ApiOperation({ summary: 'Get assets assigned to a specific user' })
  @ApiResponse({ status: 200, type: [AssetAssignmentEntity] })
  @Admin()
  @Get('user/:userId')
  getAssetsByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<AssetAssignmentEntity[]> {
    return this.assetsService.getAssetsByUser(userId);
  }

  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ status: 200, type: AssetEntity })
  @Admin()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AssetEntity> {
    return this.assetsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update asset' })
  @ApiResponse({ status: 200, type: AssetEntity })
  @Admin()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ): Promise<AssetEntity> {
    return this.assetsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @Admin()
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ success: true }> {
    await this.assetsService.remove(id);
    return { success: true };
  }

  @ApiOperation({ summary: 'Assign an asset to a user' })
  @ApiResponse({ status: 201, type: AssetAssignmentEntity })
  @Admin()
  @Post(':id/assign')
  assignAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignAssetDto,
  ): Promise<AssetAssignmentEntity> {
    return this.assetsService.assignAsset(id, dto.userId);
  }

  @ApiOperation({ summary: 'Unassign an asset' })
  @ApiResponse({ status: 200, type: AssetAssignmentEntity })
  @Admin()
  @Patch(':id/unassign')
  unassignAsset(@Param('id', ParseUUIDPipe) id: string): Promise<AssetAssignmentEntity> {
    return this.assetsService.unassignAsset(id);
  }

  @ApiOperation({ summary: 'Get assignment history for an asset' })
  @ApiResponse({ status: 200, type: [AssetAssignmentEntity] })
  @Admin()
  @Get(':id/history')
  getAssignmentHistory(@Param('id', ParseUUIDPipe) id: string): Promise<AssetAssignmentEntity[]> {
    return this.assetsService.getAssignmentHistory(id);
  }
}
