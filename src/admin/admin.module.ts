import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AssetEntity } from '../assets/entities/asset.entity';
import { AssetAssignmentEntity } from '../assets/entities/asset-assignment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AssetTypeEntity } from '../asset-types/entities/asset-type.entity';
import { AssetsModule } from '../assets/assets.module';
import { AdminAssetsController } from './admin-assets.controller';

@Module({
  imports: [
    AssetsModule,
    TypeOrmModule.forFeature([
      AssetEntity,
      AssetAssignmentEntity,
      UserEntity,
      AssetTypeEntity,
    ]),
  ],
  controllers: [AdminController, AdminAssetsController],
  providers: [AdminService],
})
export class AdminModule {}
