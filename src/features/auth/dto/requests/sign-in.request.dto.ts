import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignInRequestDto {
	@ApiProperty({ example: "a@a.com" })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: "Bulbazavr" })
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(30)
	password: string;
}
