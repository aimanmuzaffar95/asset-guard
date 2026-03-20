import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Admin } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminDashboardResponseDto } from './dtos/admin-dashboard-response.dto';

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
}
