import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength
} from "class-validator";

export class SignUpUserRequestDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(30)
	userName: string;
	@IsEmail()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(30)
	email: string;
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(30)
	password: string;
}
