import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ILike } from 'typeorm';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  firstName: 'Aiman',
  lastName: 'Muzafar',
  email: 'aiman@example.com',
} as UserEntity;

type MockRepo = {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
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

  describe('search', () => {
    it('should search by ID if valid UUID is provided', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      repo.findOne.mockResolvedValue(mockUser);

      const result = await service.search(uuid);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: uuid } });
      expect(result).toEqual([mockUser]);
    });

    it('should return empty array if ID not found', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      repo.findOne.mockResolvedValue(null);

      const result = await service.search(uuid);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: uuid } });
      expect(result).toEqual([]);
    });

    it('should fuzzy search by email/name if non-UUID provided', async () => {
      const query = 'john';
      repo.find.mockResolvedValue([mockUser]);

      const result = await service.search(query);

      expect(repo.find).toHaveBeenCalledWith({
        where: [
          { email: ILike(`%${query}%`) },
          { firstName: ILike(`%${query}%`) },
          { lastName: ILike(`%${query}%`) },
        ],
        take: 10,
      });
      expect(result).toEqual([mockUser]);
    });
  });
});
