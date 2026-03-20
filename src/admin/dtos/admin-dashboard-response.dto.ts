import { ApiProperty } from '@nestjs/swagger';

export class DashboardTotalsDto {
  @ApiProperty({ example: 150 })
  totalAssets: number;

  @ApiProperty({ example: 92 })
  assignedAssets: number;

  @ApiProperty({ example: 58 })
  availableAssets: number;

  @ApiProperty({ example: 34 })
  staffCount: number;
}

export class AssetDistributionItemDto {
  @ApiProperty({ example: 'Laptops' })
  category: string;

  @ApiProperty({ example: 65 })
  count: number;

  @ApiProperty({ example: 43 })
  percentage: number;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: () => DashboardTotalsDto })
  totals: DashboardTotalsDto;

  @ApiProperty({ type: () => [AssetDistributionItemDto] })
  assetDistribution: AssetDistributionItemDto[];
}
