import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../enums/user-roles.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    firstName: string

    @ApiProperty({ example: 'Doe' })
    @IsString()
    lastName: string

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    email: string

    @ApiProperty({ example: 'Password123!', minLength: 8 })
    @MinLength(8)
    @IsString()
    password: string

    @ApiProperty({ enum: UserRole, required: false, default: UserRole.STAFF })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole
}