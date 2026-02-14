import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class PasswordRecoverRequestDto {
	@ApiProperty({
		example: "user@example.com"
	})
	@IsNotEmpty()
	@IsEmail()
	email: string;
}
