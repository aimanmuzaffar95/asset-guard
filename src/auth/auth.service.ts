import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthEmailLoginDto } from './dtos/auth-email-login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { UserRole } from '../users/enums/user-roles.enum';
import { AuthRefreshDto } from './dtos/auth-refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly storageService: StorageService,
  ) {}

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: (process.env.JWT_EXPIRES_IN ||
        '1h') as JwtSignOptions['expiresIn'],
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
        '7d') as JwtSignOptions['expiresIn'],
    });

    return {
      accessToken,
      refreshToken,
      tokenExpires: isNaN(Number(process.env.JWT_EXPIRES_IN))
        ? 86400
        : Number(process.env.JWT_EXPIRES_IN),
      user: user,
    };
  }

  async refreshToken(dto: AuthRefreshDto): Promise<LoginResponseDto> {
    try {
      const payload = (await this.jwtService.verifyAsync(
        dto.refreshToken,
      )) as unknown as {
        email: string;
        sub: string;
        role: UserRole;
      };

      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: (process.env.JWT_EXPIRES_IN ||
          '1h') as JwtSignOptions['expiresIn'],
      });

      const refreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
          '7d') as JwtSignOptions['expiresIn'],
      });

      return {
        accessToken,
        refreshToken,
        tokenExpires: isNaN(Number(process.env.JWT_EXPIRES_IN))
          ? 86400
          : Number(process.env.JWT_EXPIRES_IN),
        user: user,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(
    dto: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserEntity> {
    let profileImageUrl: string | undefined;

    if (file) {
      profileImageUrl = await this.storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
    }

    return await this.usersService.createUser(dto, profileImageUrl);
  }
}
