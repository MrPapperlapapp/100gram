import { registerAs } from "@nestjs/config";

import { PgValidator, validateEnv } from "./validators";
import { IPgAdapter } from "./interfaces";

export const pgEnv = registerAs<IPgAdapter>("pg", () => {
	validateEnv(process.env, PgValidator);
	return {
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT),
		database: process.env.DB_NAME
	};
});
