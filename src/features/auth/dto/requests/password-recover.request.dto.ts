import { IsEmail, IsNotEmpty } from "class-validator";

export class PasswordRecoverRequestDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;
}
