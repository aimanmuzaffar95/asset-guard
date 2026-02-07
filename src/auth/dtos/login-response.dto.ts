import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "src/users/entities/user.entity";

export class LoginResponseDto {
  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty()
  user: UserEntity;
}
