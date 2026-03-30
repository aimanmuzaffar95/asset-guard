import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AssetEntity } from '../assets/entities/asset.entity';
import { AssetAssignmentEntity } from '../assets/entities/asset-assignment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-roles.enum';
import {
  AdminDashboardResponseDto,
  AssetDistributionItemDto,
} from './dtos/admin-dashboard-response.dto';
import { AssetTypeEntity } from '../asset-types/entities/asset-type.entity';
import {
  AdminAssignmentHistoryItemDto,
  AdminAssignmentHistoryResponseDto,
} from './dtos/admin-assignment-history-response.dto';

interface AssetDistributionRow {
  category: string;
  count: string;
}

@Injectable()
export class AdminService {
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

  async getDashboard(): Promise<AdminDashboardResponseDto> {
    const [totalAssets, assignedAssets, staffCount, distributionRows] =
      await Promise.all([
        this.assetRepo.count(),
        this.assignmentRepo.count({ where: { returnedAt: IsNull() } }),
        this.userRepo.count({ where: { role: UserRole.STAFF } }),
        this.assetTypeRepo
          .createQueryBuilder('assetType')
          .innerJoin('assetType.assets', 'asset')
          .select('assetType.name', 'category')
          .addSelect('COUNT(asset.id)', 'count')
          .groupBy('assetType.id')
          .addGroupBy('assetType.name')
          .orderBy('COUNT(asset.id)', 'DESC')
          .addOrderBy('assetType.name', 'ASC')
          .limit(4)
          .getRawMany<AssetDistributionRow>(),
      ]);

    const assetDistribution = distributionRows
      .map<AssetDistributionItemDto>(({ category, count }) => {
        const parsedCount = Number(count);

        return {
          category,
          count: parsedCount,
          percentage:
            totalAssets > 0 ? Math.round((parsedCount / totalAssets) * 100) : 0,
        };
      })
      .filter(({ count }) => count > 0)
      .slice(0, 4);

    return {
      totals: {
        totalAssets,
        assignedAssets,
        availableAssets: totalAssets - assignedAssets,
        staffCount,
      },
      assetDistribution,
    };
  }

  async getAssignmentHistory(
    page: number,
    limit: number,
  ): Promise<AdminAssignmentHistoryResponseDto> {
    const [assignments, total] = await this.assignmentRepo.findAndCount({
      relations: ['asset', 'asset.assetType', 'user'],
      order: { assignedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: assignments.map<AdminAssignmentHistoryItemDto>((assignment) => {
        const assetDescription =
          assignment.asset.description?.trim() ||
          assignment.asset.assetType.name;

        return {
          asset: `${assignment.asset.serialNumber} - ${assetDescription}`,
          assignedTo: `${assignment.user.firstName} ${assignment.user.lastName}`,
          date: assignment.assignedAt,
          status: assignment.returnedAt ? 'returned' : 'assigned',
        };
      }),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }
}
