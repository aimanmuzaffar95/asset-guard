import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Admin } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminDashboardResponseDto } from './dtos/admin-dashboard-response.dto';
import { AdminAssignmentHistoryResponseDto } from './dtos/admin-assignment-history-response.dto';

const MAX_ASSIGNMENT_HISTORY_LIMIT = 20;

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get admin dashboard metrics' })
  @ApiResponse({ status: 200, type: AdminDashboardResponseDto })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  @Admin()
  @Get('dashboard')
  getDashboard(): Promise<AdminDashboardResponseDto> {
    return this.adminService.getDashboard();
  }

  @ApiOperation({ summary: 'Get recent admin dashboard assignment history' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number for assignment history results',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 5,
    description: 'Number of records to return. Maximum allowed is 20.',
  })
  @ApiResponse({ status: 200, type: AdminAssignmentHistoryResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Invalid pagination parameters.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  @Admin()
  @Get('dashboard/assignment-history')
  getDashboardAssignmentHistory(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit = 5,
  ): Promise<AdminAssignmentHistoryResponseDto> {
    if (page < 1) {
      throw new BadRequestException('Page must be at least 1');
    }

    if (limit < 1) {
      throw new BadRequestException('Limit must be at least 1');
    }

    if (limit > MAX_ASSIGNMENT_HISTORY_LIMIT) {
      throw new BadRequestException(
        `Limit cannot exceed ${MAX_ASSIGNMENT_HISTORY_LIMIT}`,
      );
    }

    return this.adminService.getAssignmentHistory(page, limit);
  }
}
