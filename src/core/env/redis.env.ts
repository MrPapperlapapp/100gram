import { registerAs } from "@nestjs/config";

import { RedisValidator, validateEnv } from "./validators";
import { IRedisInterface } from "./interfaces";

export const redisEnv = registerAs<IRedisInterface>("redis", () => {
	validateEnv(process.env, RedisValidator);
	return {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT),
		user: process.env.REDIS_USER,
		pass: process.env.REDIS_PASSWORD
	};
});
