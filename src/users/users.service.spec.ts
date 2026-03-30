import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { BadRequestException } from '@nestjs/common';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  firstName: 'Aiman',
  lastName: 'Muzafar',
  email: 'aiman@example.com',
  activeAssignmentsCount: 2,
} as UserEntity & { activeAssignmentsCount: number };

const buildQbMock = (
  overrides: Partial<{
    getMany: jest.Mock;
    getOne: jest.Mock;
  }> = {},
): Record<string, jest.Mock> => {
  const qb: Record<string, jest.Mock> = {
    loadRelationCountAndMap: jest.fn(),
    skip: jest.fn(),
    take: jest.fn(),
    where: jest.fn(),
    getMany: overrides.getMany ?? jest.fn().mockResolvedValue([mockUser]),
    getOne: overrides.getOne ?? jest.fn().mockResolvedValue(null),
  };

  // Each chainable method returns the same qb mock
  qb.loadRelationCountAndMap.mockReturnValue(qb);
  qb.skip.mockReturnValue(qb);
  qb.take.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);

  return qb;
};

type MockRepo = {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  createQueryBuilder: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: MockRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          } satisfies MockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users with activeAssignmentsCount', async () => {
      const qb = buildQbMock();
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll(1);

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(qb.loadRelationCountAndMap).toHaveBeenCalled();
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockUser]);
    });

    it('should calculate correct skip for page 2', async () => {
      const qb = buildQbMock();
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll(2);

      expect(qb.skip).toHaveBeenCalledWith(10);
    });
  });

  describe('search', () => {
    it('should throw BadRequestException for empty query', async () => {
      await expect(service.search('   ')).rejects.toThrow(BadRequestException);
    });

    it('should search by ID if valid UUID is provided and user exists', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const qb = buildQbMock({ getOne: jest.fn().mockResolvedValue(mockUser) });
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.search(uuid);

      expect(qb.where).toHaveBeenCalledWith('user.id = :id', { id: uuid });
      expect(result).toEqual([mockUser]);
    });

    it('should return empty array if UUID not found', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const qb = buildQbMock({ getOne: jest.fn().mockResolvedValue(null) });
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.search(uuid);

      expect(result).toEqual([]);
    });

    it('should fuzzy search by email/name if non-UUID provided', async () => {
      const query = 'john';
      const qb = buildQbMock({
        getMany: jest.fn().mockResolvedValue([mockUser]),
      });
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.search(query);

      expect(qb.where).toHaveBeenCalledWith(
        'user.email ILIKE :q OR user.firstName ILIKE :q OR user.lastName ILIKE :q',
        { q: `%${query}%` },
      );
      expect(result).toEqual([mockUser]);
    });
  });
});
