import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssetEntity } from './entities/asset.entity';
import { AssetAssignmentEntity } from './entities/asset-assignment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { Repository, IsNull } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AssetType } from './enum/asset-type.enum';

describe('AssetsService', () => {
    let service: AssetsService;
    let assetRepo: jest.Mocked<Repository<AssetEntity>>;
    let assignmentRepo: jest.Mocked<Repository<AssetAssignmentEntity>>;
    let userRepo: jest.Mocked<Repository<UserEntity>>;

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
                    },
                },
                {
                    provide: getRepositoryToken(UserEntity),
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
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new asset if serial number is unique', async () => {
            const dto = { name: 'MacBook', serialNumber: 'SN123', type: AssetType.LAPTOP };
            assetRepo.findOne.mockResolvedValue(null);
            assetRepo.create.mockReturnValue(dto as any);
            assetRepo.save.mockResolvedValue({ id: '1', ...dto } as any);

            const result = await service.create(dto);

            expect(result).toEqual({ id: '1', ...dto });
            expect(assetRepo.findOne).toHaveBeenCalledWith({ where: { serialNumber: dto.serialNumber } });
        });

        it('should throw ConflictException if serial number already exists', async () => {
            const dto = { name: 'MacBook', serialNumber: 'SN123', type: AssetType.LAPTOP };
            assetRepo.findOne.mockResolvedValue({ id: '1' } as any);

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
        });
    });

    describe('assignAsset', () => {
        it('should assign asset if user exists and asset is available', async () => {
            const assetId = 'asset-1';
            const userId = 'user-1';
            const mockAsset = { id: assetId } as any;
            const mockUser = { id: userId } as any;

            assetRepo.findOne.mockResolvedValue(mockAsset);
            userRepo.findOneBy.mockResolvedValue(mockUser);
            assignmentRepo.findOne.mockResolvedValue(null);
            assignmentRepo.create.mockReturnValue({ asset: mockAsset, user: mockUser } as any);
            assignmentRepo.save.mockResolvedValue({ id: 'assign-1', asset: mockAsset, user: mockUser } as any);

            const result = await service.assignAsset(assetId, userId);

            expect(result.id).toBe('assign-1');
            expect(assignmentRepo.create).toHaveBeenCalledWith({ asset: mockAsset, user: mockUser });
        });

        it('should throw BadRequestException if asset is already assigned', async () => {
            const assetId = 'asset-1';
            const userId = 'user-1';
            assetRepo.findOne.mockResolvedValue({ id: assetId } as any);
            userRepo.findOneBy.mockResolvedValue({ id: userId } as any);
            assignmentRepo.findOne.mockResolvedValue({ id: 'existing-assign' } as any);

            await expect(service.assignAsset(assetId, userId)).rejects.toThrow(BadRequestException);
        });
    });

    describe('unassignAsset', () => {
        it('should unassign an asset by setting returnedAt', async () => {
            const assetId = 'asset-1';
            const mockAssignment = { id: 'assign-1', returnedAt: null } as any;
            assignmentRepo.findOne.mockResolvedValue(mockAssignment);
            assignmentRepo.save.mockImplementation(async (a) => a as any);

            const result = await service.unassignAsset(assetId);

            expect(result.returnedAt).toBeInstanceOf(Date);
            expect(assignmentRepo.save).toHaveBeenCalledWith(mockAssignment);
        });

        it('should throw BadRequestException if asset is not assigned', async () => {
            assignmentRepo.findOne.mockResolvedValue(null);

            await expect(service.unassignAsset('asset-1')).rejects.toThrow(BadRequestException);
        });
    });
});
