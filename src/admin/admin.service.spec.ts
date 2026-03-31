import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { AssetEntity } from '../assets/entities/asset.entity';
import { AssetAssignmentEntity } from '../assets/entities/asset-assignment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AssetTypeEntity } from '../asset-types/entities/asset-type.entity';
import { UserRole } from '../users/enums/user-roles.enum';

describe('AdminService', () => {
  let service: AdminService;
  let assetRepo: jest.Mocked<Repository<AssetEntity>>;
  let assignmentRepo: jest.Mocked<Repository<AssetAssignmentEntity>>;
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let assetTypeRepo: jest.Mocked<Repository<AssetTypeEntity>>;

  const queryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(AssetEntity),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AssetAssignmentEntity),
          useValue: {
            count: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AssetTypeEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    assetRepo = module.get(getRepositoryToken(AssetEntity));
    assignmentRepo = module.get(getRepositoryToken(AssetAssignmentEntity));
    userRepo = module.get(getRepositoryToken(UserEntity));
    assetTypeRepo = module.get(getRepositoryToken(AssetTypeEntity));

    queryBuilder.innerJoin.mockClear();
    queryBuilder.select.mockClear();
    queryBuilder.addSelect.mockClear();
    queryBuilder.groupBy.mockClear();
    queryBuilder.addGroupBy.mockClear();
    queryBuilder.orderBy.mockClear();
    queryBuilder.addOrderBy.mockClear();
    queryBuilder.limit.mockClear();
    queryBuilder.getRawMany.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return dashboard totals and top four distribution items', async () => {
    assetRepo.count.mockResolvedValue(150);
    assignmentRepo.count.mockResolvedValue(92);
    userRepo.count.mockResolvedValue(34);
    queryBuilder.getRawMany.mockResolvedValue([
      { category: 'Laptops', count: '65' },
      { category: 'Monitors', count: '42' },
      { category: 'Peripherals', count: '28' },
      { category: 'Mobile Phones', count: '15' },
      { category: 'Tablets', count: '8' },
    ]);

    const result = await service.getDashboard();

    expect(result).toEqual({
      totals: {
        totalAssets: 150,
        assignedAssets: 92,
        availableAssets: 58,
        staffCount: 34,
      },
      assetDistribution: [
        { category: 'Laptops', count: 65, percentage: 43 },
        { category: 'Monitors', count: 42, percentage: 28 },
        { category: 'Peripherals', count: 28, percentage: 19 },
        { category: 'Mobile Phones', count: 15, percentage: 10 },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(assignmentRepo.count).toHaveBeenCalledWith({
      where: { returnedAt: IsNull() },
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepo.count).toHaveBeenCalledWith({
      where: { role: UserRole.STAFF },
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(assetTypeRepo.createQueryBuilder).toHaveBeenCalledWith('assetType');
    expect(queryBuilder.limit).toHaveBeenCalledWith(4);
  });

  it('should return zero totals and empty distribution for an empty state', async () => {
    assetRepo.count.mockResolvedValue(0);
    assignmentRepo.count.mockResolvedValue(0);
    userRepo.count.mockResolvedValue(0);
    queryBuilder.getRawMany.mockResolvedValue([]);

    const result = await service.getDashboard();

    expect(result).toEqual({
      totals: {
        totalAssets: 0,
        assignedAssets: 0,
        availableAssets: 0,
        staffCount: 0,
      },
      assetDistribution: [],
    });
  });

  it('should filter zero-count categories and round percentages against total assets', async () => {
    assetRepo.count.mockResolvedValue(3);
    assignmentRepo.count.mockResolvedValue(1);
    userRepo.count.mockResolvedValue(2);
    queryBuilder.getRawMany.mockResolvedValue([
      { category: 'Docking Stations', count: '1' },
      { category: 'Cables', count: '0' },
      { category: 'Keyboards', count: '2' },
    ]);

    const result = await service.getDashboard();

    expect(result.assetDistribution).toEqual([
      { category: 'Docking Stations', count: 1, percentage: 33 },
      { category: 'Keyboards', count: 2, percentage: 67 },
    ]);
  });

  it('should return paginated assignment history mapped for the dashboard', async () => {
    const assignedAt = new Date('2026-03-30T10:15:00.000Z');
    const returnedAt = new Date('2026-03-31T09:00:00.000Z');

    assignmentRepo.findAndCount.mockResolvedValue([
      [
        {
          assignedAt,
          returnedAt: null,
          asset: {
            serialNumber: 'SN123',
            name: 'MacBook Pro M2',
            assetType: { name: 'Laptop' },
          },
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        {
          assignedAt: returnedAt,
          returnedAt,
          asset: {
            serialNumber: 'SN456',
            name: '  ',
            assetType: { name: 'Monitor' },
          },
          user: {
            firstName: 'Jane',
            lastName: 'Smith',
          },
        },
      ] as AssetAssignmentEntity[],
      12,
    ]);

    const result = await service.getAssignmentHistory(2, 5);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(assignmentRepo.findAndCount).toHaveBeenCalledWith({
      relations: ['asset', 'asset.assetType', 'user'],
      order: { assignedAt: 'DESC' },
      skip: 5,
      take: 5,
    });
    expect(result).toEqual({
      items: [
        {
          asset: 'SN123 - MacBook Pro M2',
          assignedTo: 'John Doe',
          date: assignedAt,
          status: 'assigned',
        },
        {
          asset: 'SN456 - Monitor',
          assignedTo: 'Jane Smith',
          date: returnedAt,
          status: 'returned',
        },
      ],
      page: 2,
      limit: 5,
      total: 12,
      totalPages: 3,
    });
  });

  it('should return empty assignment history when no records exist', async () => {
    assignmentRepo.findAndCount.mockResolvedValue([[], 0]);

    const result = await service.getAssignmentHistory(1, 5);

    expect(result).toEqual({
      items: [],
      page: 1,
      limit: 5,
      total: 0,
      totalPages: 0,
    });
  });
});
