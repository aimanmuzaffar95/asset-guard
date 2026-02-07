import { Body, Controller, Post } from '@nestjs/common';
import { AuthEmailLoginDto } from './dtos/auth-email-login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {

  constructor(private readonly service: AuthService) { }

  @Post('login')
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }

  @Post('register')
  public register(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.service.register(createUserDto);
  }
}
