import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class MailerValidator {
	@IsString()
	@IsNotEmpty()
	MAIL_HOST: string;

	@IsNumber()
	@IsPositive()
	MAIL_PORT: number;

	@IsString()
	@IsNotEmpty()
	MAIL_LOGIN: string;

	@IsString()
	@IsNotEmpty()
	MAIL_PASS: string;
}
