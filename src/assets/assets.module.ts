import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetEntity } from './entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity])],
  controllers: [AssetsController],
  providers: [AssetsService]
})
export class AssetsModule {}
