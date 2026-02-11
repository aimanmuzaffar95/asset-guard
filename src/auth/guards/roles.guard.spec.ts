import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-roles.enum';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: jest.Mocked<Reflector>;
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get(Reflector);
        jwtService = module.get(JwtService);
    });

    const mockContext = (authHeader?: string): ExecutionContext => ({
        switchToHttp: () => ({
            getRequest: () => ({
                headers: {
                    authorization: authHeader,
                },
            }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
    } as unknown as ExecutionContext);

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should return true if no roles are required', async () => {
        reflector.getAllAndOverride.mockReturnValue(null);
        const result = await guard.canActivate(mockContext());
        expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if auth header is missing', async () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
        await expect(guard.canActivate(mockContext())).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if auth header format is invalid', async () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
        await expect(guard.canActivate(mockContext('InvalidToken'))).rejects.toThrow(UnauthorizedException);
    });

    it('should return true if user has required role', async () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
        jwtService.verifyAsync.mockResolvedValue({ role: UserRole.ADMIN, sub: 'user-1' });

        const context = mockContext('Bearer valid-token');
        const result = await guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user does not have required role', async () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
        jwtService.verifyAsync.mockResolvedValue({ role: UserRole.STAFF, sub: 'user-1' });

        await expect(guard.canActivate(mockContext('Bearer valid-token'))).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException if token is invalid or expired', async () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
        jwtService.verifyAsync.mockRejectedValue(new Error('JsonWebTokenError'));

        await expect(guard.canActivate(mockContext('Bearer invalid-token'))).rejects.toThrow(UnauthorizedException);
    });
});
