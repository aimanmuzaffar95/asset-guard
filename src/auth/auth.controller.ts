import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dtos/auth-email-login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

  constructor(private readonly service: AuthService) { }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 201, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Registration successful', type: UserEntity })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Post('register')
  public register(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.service.register(createUserDto);
  }
}
