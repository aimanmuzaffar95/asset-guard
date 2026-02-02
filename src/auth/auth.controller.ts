import { Body, Controller, Post } from '@nestjs/common';
import { AuthEmailLoginDto } from './dtos/auth-email-login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private readonly service: AuthService) {}

    @Post('email/login')
    public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }
}
