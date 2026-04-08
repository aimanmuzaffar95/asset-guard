import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssetEntity } from './entities/asset.entity';
import { AssetAssignmentEntity } from './entities/asset-assignment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AssetTypeEntity } from '../asset-types/entities/asset-type.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AssetStatus } from './enums/asset-status.enum';
import { AssetInventoryItemDto } from './dtos/asset-inventory-item.dto';

describe('AssetsService', () => {
  let service: AssetsService;
  let assetRepo: jest.Mocked<Repository<AssetEntity>>;
  let assignmentRepo: jest.Mocked<Repository<AssetAssignmentEntity>>;
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let assetTypeRepo: jest.Mocked<Repository<AssetTypeEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: getRepositoryToken(AssetEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AssetAssignmentEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AssetTypeEntity),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    assetRepo = module.get(getRepositoryToken(AssetEntity));
    assignmentRepo = module.get(getRepositoryToken(AssetAssignmentEntity));
    userRepo = module.get(getRepositoryToken(UserEntity));
    assetTypeRepo = module.get(getRepositoryToken(AssetTypeEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new asset if serial number is unique', async () => {
      const dto = {
        name: 'MacBook Pro 16-inch',
        serialNumber: 'SN123',
        notes: 'Engineering device',
        assetTypeId: 'type-uuid-123',
      };
      const persistedAsset = {
        id: '1',
        ...dto,
        status: AssetStatus.AVAILABLE,
        assetType: { id: dto.assetTypeId, name: 'laptop' },
      } as unknown as AssetEntity;

      assetTypeRepo.findOneBy.mockResolvedValue({
        id: dto.assetTypeId,
      } as AssetTypeEntity);
      assetRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(persistedAsset);
      assetRepo.create.mockReturnValue({
        ...dto,
        status: AssetStatus.AVAILABLE,
      } as unknown as AssetEntity);
      assetRepo.save.mockResolvedValue(persistedAsset);

      const result = await service.create(dto);

      expect(result).toEqual(persistedAsset);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(assetRepo.findOne).toHaveBeenCalledWith({
        where: { serialNumber: dto.serialNumber },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(assetRepo.create).toHaveBeenCalledWith({
        ...dto,
        notes: dto.notes,
        status: AssetStatus.AVAILABLE,
      });
    });

    it('should throw ConflictException if serial number already exists', async () => {
      const dto = {
        name: 'MacBook Pro 16-inch',
        serialNumber: 'SN123',
        notes: 'Engineering device',
        assetTypeId: 'type-uuid-123',
      };
      assetTypeRepo.findOneBy.mockResolvedValue({
        id: dto.assetTypeId,
      } as AssetTypeEntity);
      assetRepo.findOne.mockResolvedValue({ id: '1' } as AssetEntity);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if asset type does not exist', async () => {
      const dto = {
        name: 'MacBook Pro 16-inch',
        serialNumber: 'SN123',
        notes: 'Engineering device',
        assetTypeId: 'missing-type',
      };
      assetTypeRepo.findOneBy.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should include the current assignee full name when an active assignment exists', async () => {
      const createdAt = new Date('2026-04-01T00:00:00.000Z');
      const updatedAt = new Date('2026-04-02T00:00:00.000Z');
      const assets = [
        {
          id: 'asset-1',
          name: 'MacBook Pro 16-inch',
          serialNumber: 'SN123456789',
          status: AssetStatus.ASSIGNED,
          notes: 'Engineering device',
          createdAt,
          updatedAt,
          assetType: {
            id: 'type-1',
            name: 'laptop',
            description: 'Portable computers',
          },
          assignments: [
            {
              returnedAt: null,
              user: {
                firstName: 'John',
                lastName: 'Doe',
              },
            },
          ],
        },
      ] as AssetEntity[];

      assetRepo.find.mockResolvedValue(assets);

      const result = await service.findAll();

      expect(result).toEqual<AssetInventoryItemDto[]>([
        {
          id: 'asset-1',
          name: 'MacBook Pro 16-inch',
          serialNumber: 'SN123456789',
          status: AssetStatus.ASSIGNED,
          notes: 'Engineering device',
          createdAt,
          updatedAt,
          assignedTo: 'John Doe',
          assetType: {
            id: 'type-1',
            name: 'laptop',
            description: 'Portable computers',
          },
        },
      ]);
      expect(assetRepo.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        relations: ['assetType', 'assignments', 'assignments.user'],
      });
    });

    it('should set assignedTo to null when no active assignment exists', async () => {
      const createdAt = new Date('2026-04-01T00:00:00.000Z');
      const updatedAt = new Date('2026-04-02T00:00:00.000Z');
      const assets = [
        {
          id: 'asset-1',
          name: 'MacBook Pro 16-inch',
          serialNumber: 'SN123456789',
          status: AssetStatus.AVAILABLE,
          notes: null,
          createdAt,
          updatedAt,
          assetType: {
            id: 'type-1',
            name: 'laptop',
            description: null,
          },
          assignments: [],
        },
      ] as AssetEntity[];

      assetRepo.find.mockResolvedValue(assets);

      const result = await service.findAll();

      expect(result).toEqual<AssetInventoryItemDto[]>([
        {
          id: 'asset-1',
          name: 'MacBook Pro 16-inch',
          serialNumber: 'SN123456789',
          status: AssetStatus.AVAILABLE,
          notes: null,
          createdAt,
          updatedAt,
          assignedTo: null,
          assetType: {
            id: 'type-1',
            name: 'laptop',
            description: null,
          },
        },
      ]);
    });

    it('should ignore returned assignments when deriving assignedTo', async () => {
      const createdAt = new Date('2026-04-01T00:00:00.000Z');
      const updatedAt = new Date('2026-04-02T00:00:00.000Z');
      const assets = [
        {
          id: 'asset-1',
          name: 'MacBook Pro 16-inch',
          serialNumber: 'SN123456789',
          status: AssetStatus.AVAILABLE,
          notes: null,
          createdAt,
          updatedAt,
          assetType: {
            id: 'type-1',
            name: 'laptop',
            description: null,
          },
          assignments: [
            {
              returnedAt: new Date('2026-04-03T00:00:00.000Z'),
              user: {
                firstName: 'Past',
                lastName: 'Assignee',
              },
            },
          ],
        },
      ] as AssetEntity[];

      assetRepo.find.mockResolvedValue(assets);

      const result = await service.findAll();

      expect(result[0]?.assignedTo).toBeNull();
    });
  });

  describe('assignAsset', () => {
    it('should assign asset if user exists and asset is available', async () => {
      const assetId = 'asset-1';
      const userId = 'user-1';
      const mockAsset = {
        id: assetId,
        status: AssetStatus.AVAILABLE,
      } as AssetEntity;
      const mockUser = { id: userId } as UserEntity;

      assetRepo.findOne.mockResolvedValue(mockAsset);
      assetRepo.create.mockImplementation((value) => value as AssetEntity);
      assetRepo.save.mockResolvedValue({
        ...mockAsset,
        status: AssetStatus.ASSIGNED,
      } as AssetEntity);
      userRepo.findOneBy.mockResolvedValue(mockUser);
      assignmentRepo.findOne.mockResolvedValue(null);
      assignmentRepo.create.mockReturnValue({
        asset: mockAsset,
        user: mockUser,
      } as AssetAssignmentEntity);
      assignmentRepo.save.mockResolvedValue({
        id: 'assign-1',
        asset: mockAsset,
        user: mockUser,
      } as AssetAssignmentEntity);

      const result = await service.assignAsset(assetId, userId);

      expect(result.id).toBe('assign-1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(assignmentRepo.create).toHaveBeenCalledWith({
        asset: mockAsset,
        user: mockUser,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(assetRepo.save).toHaveBeenCalledWith({
        ...mockAsset,
        status: AssetStatus.ASSIGNED,
      });
    });

    it('should throw BadRequestException if asset is already assigned', async () => {
      const assetId = 'asset-1';
      const userId = 'user-1';
      assetRepo.findOne.mockResolvedValue({ id: assetId } as AssetEntity);
      userRepo.findOneBy.mockResolvedValue({ id: userId } as UserEntity);
      assignmentRepo.findOne.mockResolvedValue({
        id: 'existing-assign',
      } as AssetAssignmentEntity);

      await expect(service.assignAsset(assetId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAssetsByUser', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      userRepo.findOneBy.mockResolvedValue(null);

      await expect(service.getAssetsByUser('missing-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unassignAsset', () => {
    it('should unassign an asset by setting returnedAt', async () => {
      const assetId = 'asset-1';
      const asset = {
        id: assetId,
        status: AssetStatus.ASSIGNED,
      } as AssetEntity;
      const mockAssignment = {
        id: 'assign-1',
        returnedAt: null,
        asset,
      } as unknown as AssetAssignmentEntity;
      assignmentRepo.findOne.mockResolvedValue(mockAssignment);
      assetRepo.create.mockImplementation((value) => value as AssetEntity);
      assetRepo.save.mockResolvedValue({
        ...asset,
        status: AssetStatus.AVAILABLE,
      } as AssetEntity);
      assignmentRepo.save.mockImplementation(async (a) =>
        Promise.resolve(a as AssetAssignmentEntity),
      );

      const result = await service.unassignAsset(assetId);

      expect(result.returnedAt).toBeInstanceOf(Date);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(assignmentRepo.save).toHaveBeenCalledWith(mockAssignment);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(assetRepo.save).toHaveBeenCalledWith({
        ...asset,
        status: AssetStatus.AVAILABLE,
      });
    });

    it('should throw BadRequestException if asset is not assigned', async () => {
      assignmentRepo.findOne.mockResolvedValue(null);

      await expect(service.unassignAsset('asset-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
