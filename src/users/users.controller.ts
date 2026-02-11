import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Admin } from '../auth/decorators/roles.decorator';
import { UserEntity } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @ApiOperation({ summary: 'List all users' })
    @ApiResponse({ status: 200, type: [UserEntity], description: 'Returns a list of all users.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Admin access required.' })
    @Admin()
    @Get()
    async findAll(): Promise<UserEntity[]> {
        return await this.usersService.findAll();
    }
}
