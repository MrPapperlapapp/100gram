import { registerAs } from "@nestjs/config";
import { IRecaptchaConfig } from "@/core/env/interfaces";
import { RecaptchaValidator, validateEnv } from "@/core/env/validators";

export const recaptchaEnv = registerAs<IRecaptchaConfig>("recaptcha", () => {
	validateEnv(process.env, RecaptchaValidator);
	return {
		secret: process.env.GOOGLE_RECAPTCHA_SECRET
	};
});
