import { IsEmail, IsNotEmpty } from "class-validator";
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from "src/utils/lower-case.transformation";
import { ApiProperty } from "@nestjs/swagger";

export class AuthEmailLoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  password: string;
}