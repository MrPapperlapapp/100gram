import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignUpUserRequestDto {
	@ApiProperty({ example: "Vasya" })
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(30)
	userName: string;
	@ApiProperty({ example: "a@a.com" })
	@IsEmail()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(30)
	email: string;
	@ApiProperty({ example: "Bulbazavr" })
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(30)
	password: string;
}
