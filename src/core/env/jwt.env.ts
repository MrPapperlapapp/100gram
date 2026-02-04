import { registerAs } from "@nestjs/config";

import { JwtValidator, validateEnv } from "./validators";
import { IJwtConfig } from "./interfaces";

export const jwtEnv = registerAs<IJwtConfig>("jwt", () => {
	validateEnv(process.env, JwtValidator);
	return {
		secret: process.env.JWT_SECRET
	};
});
