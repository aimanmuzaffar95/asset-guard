import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-roles.enum';
import { AssetStatus } from './enums/asset-status.enum';
import { AssetInventoryItemDto } from './dtos/asset-inventory-item.dto';

describe('AssetsController', () => {
  let controller: AssetsController;
  let assetsService: jest.Mocked<AssetsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        {
          provide: AssetsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            getAssetsByUser: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            assignAsset: jest.fn(),
            unassignAsset: jest.fn(),
            getAssignmentHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AssetsController>(AssetsController);
    assetsService = module.get(AssetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should protect findAll with the admin role decorator', () => {
    const findAllHandler = Object.getOwnPropertyDescriptor(
      AssetsController.prototype,
      'findAll',
    )?.value as object | undefined;

    expect(findAllHandler).toBeDefined();

    expect(Reflect.getMetadata(ROLES_KEY, findAllHandler as object)).toEqual([
      UserRole.ADMIN,
    ]);
  });

  it('should delegate inventory listing to the assets service', async () => {
    const assets: AssetInventoryItemDto[] = [
      {
        id: 'asset-1',
        name: 'MacBook Pro 16-inch',
        serialNumber: 'SN123456789',
        status: AssetStatus.ASSIGNED,
        notes: 'Engineering device',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-02T00:00:00.000Z'),
        assignedTo: 'John Doe',
        assetType: {
          id: 'type-1',
          name: 'laptop',
          description: 'Portable computers',
        },
      },
    ];

    assetsService.findAll.mockResolvedValue(assets);

    const result = await controller.findAll();

    expect(result).toEqual(assets);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(assetsService.findAll).toHaveBeenCalled();
  });
});
