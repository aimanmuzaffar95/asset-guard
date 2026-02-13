import { ConflictException, Injectable } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
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

  async search(query: string): Promise<UserEntity[]> {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        query,
      );

    if (isUUID) {
      const user = await this.userRepo.findOne({ where: { id: query } });
      return user ? [user] : [];
    }

    return await this.userRepo.find({
      where: [
        { email: ILike(`%${query}%`) },
        { firstName: ILike(`%${query}%`) },
        { lastName: ILike(`%${query}%`) },
      ],
      take: 10,
    });
  }
}
