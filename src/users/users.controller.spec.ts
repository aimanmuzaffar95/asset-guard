import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';

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
            const mockUsers = [{ id: '1', email: 'test@test.com' }] as UserEntity[];
            service.findAll.mockResolvedValue(mockUsers);

            const result = await controller.findAll(2);

            expect(result).toBe(mockUsers);
            expect(service.findAll).toHaveBeenCalledWith(2);
        });

        it('should use default value of 1 for page if not provided by pipe logic (simulated)', async () => {
            const mockUsers = [] as UserEntity[];
            service.findAll.mockResolvedValue(mockUsers);

            const result = await controller.findAll(1);

            expect(result).toBe(mockUsers);
            expect(service.findAll).toHaveBeenCalledWith(1);
        });
    });
});
