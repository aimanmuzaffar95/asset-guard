import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
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
            getAssignmentHistory: jest.fn(),
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

  it('should protect assignment history with the admin role decorator', () => {
    expect(
      // eslint-disable-next-line @typescript-eslint/unbound-method
      Reflect.getMetadata(ROLES_KEY, controller.getDashboardAssignmentHistory),
    ).toEqual([UserRole.ADMIN]);
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

  it('should return assignment history with default page and limit', async () => {
    const history = {
      items: [
        {
          asset: 'SN123 - MacBook Pro M2',
          assignedTo: 'John Doe',
          date: new Date('2026-03-30T10:15:00.000Z'),
          status: 'assigned' as const,
        },
      ],
      page: 1,
      limit: 5,
      total: 1,
      totalPages: 1,
    };
    service.getAssignmentHistory.mockResolvedValue(history);

    const result = await controller.getDashboardAssignmentHistory();

    expect(result).toBe(history);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.getAssignmentHistory).toHaveBeenCalledWith(1, 5);
  });

  it('should forward custom page and limit to the service', async () => {
    const history = {
      items: [],
      page: 2,
      limit: 10,
      total: 12,
      totalPages: 2,
    };
    service.getAssignmentHistory.mockResolvedValue(history);

    const result = await controller.getDashboardAssignmentHistory(2, 10);

    expect(result).toBe(history);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.getAssignmentHistory).toHaveBeenCalledWith(2, 10);
  });

  it('should reject limits above 20', () => {
    expect(() => controller.getDashboardAssignmentHistory(1, 21)).toThrow(
      BadRequestException,
    );
  });
});
