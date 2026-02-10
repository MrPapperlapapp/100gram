import { IsNotEmpty, IsString } from "class-validator";

export class RecaptchaValidator {
	@IsNotEmpty()
	@IsString()
	GOOGLE_RECAPTCHA_SECRET: string;
}
