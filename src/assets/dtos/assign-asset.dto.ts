import { IsNotEmpty, IsUUID } from "class-validator";

export class AssignAssetDto {
    @IsNotEmpty()
    @IsUUID()
    userId: string;
}
