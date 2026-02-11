import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AssetEntity } from './entities/asset.entity';
import { CreateAssetDto } from './dtos/create-asset.dto';
import { UpdateAssetDto } from './dtos/update-asset.dto';
import { AssetAssignmentEntity } from './entities/asset-assignment.entity';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
    @InjectRepository(AssetAssignmentEntity)
    private readonly assignmentRepo: Repository<AssetAssignmentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async create(dto: CreateAssetDto): Promise<AssetEntity> {
    const existing = await this.assetRepo.findOne({
      where: { serialNumber: dto.serialNumber },
    });

    if (existing) {
      throw new ConflictException(
        'Asset with this serial number already exists',
      );
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

  async assignAsset(
    id: string,
    userId: string,
  ): Promise<AssetAssignmentEntity> {
    const asset = await this.findOne(id);
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingAssignment = await this.assignmentRepo.findOne({
      where: { asset: { id: asset.id }, returnedAt: IsNull() },
    });

    if (existingAssignment) {
      throw new BadRequestException('Asset is already assigned');
    }

    const assignment = this.assignmentRepo.create({
      asset,
      user,
    });

    return this.assignmentRepo.save(assignment);
  }

  async unassignAsset(id: string): Promise<AssetAssignmentEntity> {
    const activeAssignment = await this.assignmentRepo.findOne({
      where: { asset: { id }, returnedAt: IsNull() },
      relations: ['asset', 'user'],
    });

    if (!activeAssignment) {
      throw new BadRequestException('Asset is not currently assigned');
    }

    activeAssignment.returnedAt = new Date();
    return this.assignmentRepo.save(activeAssignment);
  }

  async getAssetsByUser(userId: string): Promise<AssetAssignmentEntity[]> {
    return this.assignmentRepo.find({
      where: { user: { id: userId }, returnedAt: IsNull() },
      relations: ['asset'],
    });
  }

  async getAssignmentHistory(id: string): Promise<AssetAssignmentEntity[]> {
    await this.findOne(id);

    return this.assignmentRepo.find({
      where: { asset: { id } },
      relations: ['user'],
      order: { assignedAt: 'DESC' },
    });
  }
}
