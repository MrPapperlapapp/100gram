import { IsEmail, IsNotEmpty } from "class-validator";

export class ResendConfirmationTokenRequestDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;
}
