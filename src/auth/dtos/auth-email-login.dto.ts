import { IsEmail, IsNotEmpty } from "class-validator";
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from "src/utils/lower-case.transformation";

export class AuthEmailLoginDto {
  @Transform(lowerCaseTransformer)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}