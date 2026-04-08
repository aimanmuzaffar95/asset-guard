import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { AssetEntity } from './entities/asset.entity';
import { CreateAssetDto } from './dtos/create-asset.dto';
import { UpdateAssetDto } from './dtos/update-asset.dto';
import { AssetAssignmentEntity } from './entities/asset-assignment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AssetTypeEntity } from '../asset-types/entities/asset-type.entity';
import { AssetStatus } from './enums/asset-status.enum';
import { AssetInventoryItemDto } from './dtos/asset-inventory-item.dto';

const UNIQUE_VIOLATION_ERROR_CODE = '23505';

interface DatabaseErrorWithCode {
  code?: unknown;
}

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
    @InjectRepository(AssetAssignmentEntity)
    private readonly assignmentRepo: Repository<AssetAssignmentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AssetTypeEntity)
    private readonly assetTypeRepo: Repository<AssetTypeEntity>,
  ) {}

  async create(dto: CreateAssetDto): Promise<AssetEntity> {
    const serialNumber = dto.serialNumber.trim();
    const name = dto.name.trim();
    const notes = this.normalizeNotes(dto.notes);

    await this.ensureAssetTypeExists(dto.assetTypeId);
    await this.ensureSerialNumberIsUnique(serialNumber);

    const asset = this.assetRepo.create({
      name,
      assetTypeId: dto.assetTypeId,
      serialNumber,
      notes,
      status: AssetStatus.AVAILABLE,
    });

    const savedAsset = await this.saveAsset(asset);
    return this.findOne(savedAsset.id);
  }

  async findAll(): Promise<AssetInventoryItemDto[]> {
    const assets = await this.assetRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['assetType', 'assignments', 'assignments.user'],
    });

    return assets.map((asset) => {
      const activeAssignment = asset.assignments.find(
        (assignment) => assignment.returnedAt === null,
      );

      return {
        id: asset.id,
        name: asset.name,
        serialNumber: asset.serialNumber,
        status: asset.status,
        notes: asset.notes ?? null,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
        assetType: {
          id: asset.assetType.id,
          name: asset.assetType.name,
          description: asset.assetType.description ?? null,
        },
        assignedTo: activeAssignment
          ? `${activeAssignment.user.firstName} ${activeAssignment.user.lastName}`
          : null,
      };
    });
  }

  async findOne(id: string): Promise<AssetEntity> {
    const asset = await this.assetRepo.findOne({
      where: { id },
      relations: ['assetType'],
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async update(id: string, dto: UpdateAssetDto): Promise<AssetEntity> {
    const asset = await this.findOne(id);

    if (dto.assetTypeId) {
      await this.ensureAssetTypeExists(dto.assetTypeId);
    }

    const nextSerialNumber = dto.serialNumber?.trim() ?? asset.serialNumber;

    if (nextSerialNumber !== asset.serialNumber) {
      await this.ensureSerialNumberIsUnique(nextSerialNumber, asset.id);
    }

    const updatedAsset = this.assetRepo.create({
      ...asset,
      name: dto.name?.trim() ?? asset.name,
      assetTypeId: dto.assetTypeId ?? asset.assetTypeId,
      serialNumber: nextSerialNumber,
      notes:
        dto.notes !== undefined ? this.normalizeNotes(dto.notes) : asset.notes,
    });

    await this.saveAsset(updatedAsset);
    return this.findOne(id);
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

    const savedAssignment = await this.assignmentRepo.save(assignment);
    await this.saveAsset(
      this.assetRepo.create({
        ...asset,
        status: AssetStatus.ASSIGNED,
      }),
    );

    return savedAssignment;
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
    const updatedAssignment = await this.assignmentRepo.save(activeAssignment);

    await this.saveAsset(
      this.assetRepo.create({
        ...activeAssignment.asset,
        status: AssetStatus.AVAILABLE,
      }),
    );

    return updatedAssignment;
  }

  async getAssetsByUser(userId: string): Promise<AssetAssignmentEntity[]> {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.assignmentRepo.find({
      where: { user: { id: userId }, returnedAt: IsNull() },
      relations: ['asset', 'asset.assetType'],
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

  private async ensureAssetTypeExists(assetTypeId: string): Promise<void> {
    const assetType = await this.assetTypeRepo.findOneBy({ id: assetTypeId });
    if (!assetType) {
      throw new NotFoundException('Asset type not found');
    }
  }

  private normalizeNotes(notes?: string | null): string | null {
    if (typeof notes !== 'string') {
      return null;
    }

    const trimmedNotes = notes.trim();
    return trimmedNotes.length > 0 ? trimmedNotes : null;
  }

  private async ensureSerialNumberIsUnique(
    serialNumber: string,
    currentAssetId?: string,
  ): Promise<void> {
    const existingAsset = await this.assetRepo.findOne({
      where: { serialNumber },
    });

    if (existingAsset && existingAsset.id !== currentAssetId) {
      throw new ConflictException(
        'Asset with this serial number already exists',
      );
    }
  }

  private async saveAsset(asset: AssetEntity): Promise<AssetEntity> {
    try {
      return await this.assetRepo.save(asset);
    } catch (error: unknown) {
      const driverError =
        error instanceof QueryFailedError &&
        typeof error.driverError === 'object' &&
        error.driverError !== null
          ? (error.driverError as DatabaseErrorWithCode)
          : null;

      if (
        error instanceof QueryFailedError &&
        driverError?.code === UNIQUE_VIOLATION_ERROR_CODE
      ) {
        throw new ConflictException(
          'Asset with this serial number already exists',
        );
      }

      throw error;
    }
  }
}
