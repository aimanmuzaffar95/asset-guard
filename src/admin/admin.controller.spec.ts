import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-roles.enum';

describe('AdminController', () => {
  let controller: AdminController;
  let service: jest.Mocked<AdminService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            getDashboard: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be protected with the admin role decorator', () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Reflect.getMetadata(ROLES_KEY, controller.getDashboard)).toEqual([
      UserRole.ADMIN,
    ]);
  });

  it('should return dashboard data from the service', async () => {
    const dashboard = {
      totals: {
        totalAssets: 150,
        assignedAssets: 92,
        availableAssets: 58,
        staffCount: 34,
      },
      assetDistribution: [{ category: 'Laptops', count: 65, percentage: 43 }],
    };
    service.getDashboard.mockResolvedValue(dashboard);

    const result = await controller.getDashboard();

    expect(result).toBe(dashboard);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.getDashboard).toHaveBeenCalledTimes(1);
  });
});
