import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dtos/auth-email-login.dto';
import { AuthRefreshDto } from './dtos/auth-refresh.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { Throttle } from '@nestjs/throttler';

const envNumber = (key: string, fallback: number): number => {
  const parsed = Number(process.env[key]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const THROTTLE_AUTH_LOGIN_TTL_MS = envNumber(
  'THROTTLE_AUTH_LOGIN_TTL_MS',
  60_000,
);
const THROTTLE_AUTH_LOGIN_LIMIT = envNumber('THROTTLE_AUTH_LOGIN_LIMIT', 5);
const THROTTLE_AUTH_REFRESH_TTL_MS = envNumber(
  'THROTTLE_AUTH_REFRESH_TTL_MS',
  60_000,
);
const THROTTLE_AUTH_REFRESH_LIMIT = envNumber(
  'THROTTLE_AUTH_REFRESH_LIMIT',
  20,
);
const THROTTLE_AUTH_REGISTER_TTL_MS = envNumber(
  'THROTTLE_AUTH_REGISTER_TTL_MS',
  60_000,
);
const THROTTLE_AUTH_REGISTER_LIMIT = envNumber(
  'THROTTLE_AUTH_REGISTER_LIMIT',
  3,
);

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Throttle({
    default: {
      ttl: THROTTLE_AUTH_LOGIN_TTL_MS,
      limit: THROTTLE_AUTH_LOGIN_LIMIT,
    },
  })
  @Post('login')
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 201,
    description: 'Token refresh successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Throttle({
    default: {
      ttl: THROTTLE_AUTH_REFRESH_TTL_MS,
      limit: THROTTLE_AUTH_REFRESH_LIMIT,
    },
  })
  @Post('refresh')
  public refresh(
    @Body() refreshDto: AuthRefreshDto,
  ): Promise<LoginResponseDto> {
    return this.service.refreshToken(refreshDto);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: UserEntity,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @Throttle({
    default: {
      ttl: THROTTLE_AUTH_REGISTER_TTL_MS,
      limit: THROTTLE_AUTH_REGISTER_LIMIT,
    },
  })
  @Post('register')
  @UseInterceptors(FileInterceptor('profileImage'))
  public async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserEntity> {
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (file.size > maxSize) {
        throw new BadRequestException('File size exceeds 10MB limit');
      }

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only jpg, jpeg, png, gif, and webp are allowed',
        );
      }
    }

    return this.service.register(createUserDto, file);
  }
}
