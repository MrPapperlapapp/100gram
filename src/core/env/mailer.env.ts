import { registerAs } from "@nestjs/config";

import { MailerValidator, validateEnv } from "./validators";
import { IMailerInterface } from "./interfaces";

export const mailerEnv = registerAs<IMailerInterface>("mailer", () => {
	validateEnv(process.env, MailerValidator);
	return {
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		user: process.env.MAIL_LOGIN,
		pass: process.env.MAIL_PASS
	};
});
