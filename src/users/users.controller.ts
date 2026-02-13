import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Admin } from '../auth/decorators/roles.decorator';
import { UserEntity } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'List all users with pagination' })
  @ApiQuery({
    name: 'page',
    description: 'The page number to retrieve (starts from 1)',
    required: false,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    type: [UserEntity],
    description: 'Returns a list of 10 users for the specified page.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  @Admin()
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<UserEntity[]> {
    return await this.usersService.findAll(page);
  }

  @ApiOperation({ summary: 'Search users by ID, email, or name' })
  @ApiQuery({
    name: 'q',
    description: 'Search query (UUID for exact match, or text for fuzzy match)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    type: [UserEntity],
    description: 'Returns a list of matching users.',
  })
  @Admin()
  @Get('search')
  async search(@Query('q') query: string): Promise<UserEntity[]> {
    return await this.usersService.search(query);
  }
}
