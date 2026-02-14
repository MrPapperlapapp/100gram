import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class NewPasswordRequestDto {
	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000"
	})
	@IsNotEmpty()
	@IsString()
	token: string;

	@ApiProperty({
		example: "NewSecurePassword123"
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	@MaxLength(30)
	password: string;
}
