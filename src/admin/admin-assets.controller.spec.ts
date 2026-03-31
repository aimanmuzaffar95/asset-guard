import { Test, TestingModule } from '@nestjs/testing';
import { AdminAssetsController } from './admin-assets.controller';
import { AssetsService } from '../assets/assets.service';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-roles.enum';
import { AssetStatus } from '../assets/enums/asset-status.enum';

describe('AdminAssetsController', () => {
  let controller: AdminAssetsController;
  let assetsService: jest.Mocked<AssetsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAssetsController],
      providers: [
        {
          provide: AssetsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminAssetsController>(AdminAssetsController);
    assetsService = module.get(AssetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should protect create with the admin role decorator', () => {
    const createHandler = Object.getOwnPropertyDescriptor(
      AdminAssetsController.prototype,
      'create',
    )?.value as object | undefined;

    expect(createHandler).toBeDefined();

    expect(Reflect.getMetadata(ROLES_KEY, createHandler as object)).toEqual([
      UserRole.ADMIN,
    ]);
  });

  it('should delegate asset creation to the assets service', async () => {
    const dto = {
      name: 'MacBook Pro 16-inch',
      assetTypeId: '550e8400-e29b-41d4-a716-446655440000',
      serialNumber: 'SN123456789',
      notes: 'Engineering device',
    };
    const createdAsset = {
      id: 'asset-1',
      ...dto,
      status: AssetStatus.AVAILABLE,
    };

    assetsService.create.mockResolvedValue(createdAsset as never);

    const result = await controller.create(dto);

    expect(result).toEqual(createdAsset);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(assetsService.create).toHaveBeenCalledWith(dto);
  });
});
