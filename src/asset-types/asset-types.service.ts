import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetTypeEntity } from './entities/asset-type.entity';
import { Repository } from 'typeorm';
import { CreateAssetTypeDto } from './dtos/create-asset-type.dto';

@Injectable()
export class AssetTypesService {
  constructor(
    @InjectRepository(AssetTypeEntity)
    private readonly assetTypesRepository: Repository<AssetTypeEntity>,
  ) {}

  async create(dto: CreateAssetTypeDto): Promise<AssetTypeEntity> {
    const existing = await this.assetTypesRepository.findOneBy({
      name: dto.name,
    });
    if (existing) {
      throw new ConflictException('Asset type already exists');
    }

    const assetType = this.assetTypesRepository.create(dto);
    return this.assetTypesRepository.save(assetType);
  }

  async findAll(): Promise<AssetTypeEntity[]> {
    return this.assetTypesRepository.find();
  }

  async findByName(name: string): Promise<AssetTypeEntity | null> {
    return this.assetTypesRepository.findOneBy({ name });
  }

  async findById(id: string): Promise<AssetTypeEntity | null> {
    return this.assetTypesRepository.findOneBy({ id });
  }
}
