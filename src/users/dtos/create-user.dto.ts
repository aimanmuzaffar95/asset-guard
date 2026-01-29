import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../enums/user-roles.enum";

export class CreateUserDto {
    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsEmail()
    email: string

    @MinLength(8)
    @IsString()
    password: string

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole
}