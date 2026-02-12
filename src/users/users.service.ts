import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from './enums/user-roles.enum';

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

  async findAll(page: number): Promise<UserEntity[]> {
    const take = 10;
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * take;

    return await this.userRepo.find({
      skip,
      take,
    });
  }
}
