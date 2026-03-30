import { ApiProperty } from '@nestjs/swagger';

export class AdminAssignmentHistoryItemDto {
  @ApiProperty({ example: 'SN123456789 - MacBook Pro M2' })
  asset: string;

  @ApiProperty({ example: 'John Doe' })
  assignedTo: string;

  @ApiProperty({ example: '2026-03-30T10:15:00.000Z' })
  date: Date;

  @ApiProperty({ enum: ['assigned', 'returned'], example: 'assigned' })
  status: 'assigned' | 'returned';
}

export class AdminAssignmentHistoryResponseDto {
  @ApiProperty({ type: () => [AdminAssignmentHistoryItemDto] })
  items: AdminAssignmentHistoryItemDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 5 })
  limit: number;

  @ApiProperty({ example: 24 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
