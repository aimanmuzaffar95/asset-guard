import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "../../users/entities/user.entity";

export class LoginResponseDto {
  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty()
  user: UserEntity;
}
