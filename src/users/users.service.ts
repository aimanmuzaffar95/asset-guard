import {
  ConflictException,
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
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
  ) { }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
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
    });

    return await this.userRepo.save(user);
  }

  async findByEmail(email: UserEntity['email']): Promise<UserEntity | null> {
    if (!email) return null;

    const entity = await this.userRepo.findOne({
      where: { email },
    });

    return entity;
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepo.find();
  }
}
