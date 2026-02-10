import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class NewPasswordRequestDto {
	@IsNotEmpty()
	@IsString()
	token: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	@MaxLength(30)
	password: string;
}
