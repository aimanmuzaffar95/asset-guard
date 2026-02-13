import { Module } from '@nestjs/common';
import { AssetTypesService } from './asset-types.service';
import { AssetTypesController } from './asset-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetTypeEntity } from './entities/asset-type.entity';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AssetTypeEntity]), AuthModule],
  controllers: [AssetTypesController],
  providers: [AssetTypesService],
  exports: [AssetTypesService],
})
export class AssetTypesModule {}
