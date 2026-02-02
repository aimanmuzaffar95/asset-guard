import { UserEntity } from "src/users/entities/user.entity";

export class LoginResponseDto {
  refreshToken: string
  tokenExpires: number
  user: UserEntity
}
