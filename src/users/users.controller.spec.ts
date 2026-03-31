import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserResponseDto } from './dtos/user-response.dto';
import { PaginatedUsersResponseDto } from './dtos/paginated-users-response.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with correct page number', async () => {
      const mockResponse = {
        items: [
          { id: '1', email: 'test@test.com', activeAssignmentsCount: 0 },
        ] as UserResponseDto[],
        currentPage: 2,
        totalPages: 4,
        hasNext: true,
      } as PaginatedUsersResponseDto;
      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(2);

      expect(result).toBe(mockResponse);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAll).toHaveBeenCalledWith(2);
    });

    it('should use default value of 1 for page if not provided by pipe logic (simulated)', async () => {
      const mockResponse = {
        items: [] as UserResponseDto[],
        currentPage: 1,
        totalPages: 0,
        hasNext: false,
      } as PaginatedUsersResponseDto;
      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(1);

      expect(result).toBe(mockResponse);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });
});
