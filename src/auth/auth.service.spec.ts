import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/enums/user-roles.enum';
import { UserEntity } from '../users/entities/user.entity';
import { StorageService } from '../storage/storage.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: UserEntity = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    passwordHash: 'hashed-password',
    role: UserRole.STAFF,
    profileImageUrl: null,
    profileImageKey: null,
    assignments: [],
  } as UserEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateLogin', () => {
    it('should return login response when credentials are valid', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.validateLogin(loginDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'access-token',
        tokenExpires: 86400,
        user: mockUser,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when user is not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password',
      };
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.validateLogin(loginDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateLogin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should call usersService.createUser', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: 'password',
        firstName: 'Jane',
        lastName: 'Doe',
      };
      usersService.createUser.mockResolvedValue(mockUser);

      const result = await service.register(createUserDto);

      expect(result).toEqual(mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).toHaveBeenCalledWith(
        createUserDto,
        undefined,
      );
    });
  });
});
