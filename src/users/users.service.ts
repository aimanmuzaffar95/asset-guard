import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from './enums/user-roles.enum';
import { UserResponseDto } from './dtos/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async createUser(
    dto: CreateUserDto,
    profileImageUrl?: string,
  ): Promise<UserEntity> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const role = dto.role ?? UserRole.STAFF;

    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash: hashedPassword,
      role,
      profileImageUrl: profileImageUrl || null,
    });

    return await this.userRepo.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    if (!email) return null;

    const entity = await this.userRepo.findOne({
      where: { email },
    });

    return entity;
  }

  async findAll(page: number): Promise<UserResponseDto[]> {
    const take = 10;
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * take;

    return this.userRepo
      .createQueryBuilder('user')
      .loadRelationCountAndMap(
        'user.activeAssignmentsCount',
        'user.assignments',
        'assignment',
        (qb) => qb.where('assignment.returnedAt IS NULL'),
      )
      .skip(skip)
      .take(take)
      .getMany() as Promise<UserResponseDto[]>;
  }

  async search(query: string): Promise<UserResponseDto[]> {
    const sanitizedQuery = query?.trim();
    if (!sanitizedQuery) {
      throw new BadRequestException('Search query is required');
    }

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        sanitizedQuery,
      );

    const qb = this.userRepo
      .createQueryBuilder('user')
      .loadRelationCountAndMap(
        'user.activeAssignmentsCount',
        'user.assignments',
        'assignment',
        (qb) => qb.where('assignment.returnedAt IS NULL'),
      );

    if (isUUID) {
      const user = await qb
        .where('user.id = :id', { id: sanitizedQuery })
        .getOne();
      return user ? [user as UserResponseDto] : [];
    }

    return qb
      .where(
        'user.email ILIKE :q OR user.firstName ILIKE :q OR user.lastName ILIKE :q',
        { q: `%${sanitizedQuery}%` },
      )
      .take(10)
      .getMany() as Promise<UserResponseDto[]>;
  }
}
