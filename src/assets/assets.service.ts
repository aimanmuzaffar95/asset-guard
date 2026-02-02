import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetEntity } from './entities/asset.entity';
import { CreateAssetDto } from './dtos/create-asset.dto';
import { UpdateAssetDto } from './dtos/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
  ) {}

  async create(dto: CreateAssetDto): Promise<AssetEntity> {
    const existing = await this.assetRepo.findOne({
      where: { serialNumber: dto.serialNumber },
    });

    if (existing) {
      throw new ConflictException('Asset with this serial number already exists');
    }

    const asset = this.assetRepo.create(dto);
    return await this.assetRepo.save(asset);
  }

  async findAll(): Promise<AssetEntity[]> {
    return await this.assetRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AssetEntity> {
    const asset = await this.assetRepo.findOne({ where: { id } });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async update(id: string, dto: UpdateAssetDto): Promise<AssetEntity> {
    const asset = await this.findOne(id);

    Object.assign(asset, dto);
    return await this.assetRepo.save(asset);
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id);
    await this.assetRepo.remove(asset);
  }
}
