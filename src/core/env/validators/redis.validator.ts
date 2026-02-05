import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class RedisValidator {
	@IsString()
	@IsNotEmpty()
	REDIS_HOST: string;

	@IsNumber()
	@IsPositive()
	REDIS_PORT: number;

	@IsString()
	@IsNotEmpty()
	REDIS_USER: string;

	@IsString()
	@IsNotEmpty()
	REDIS_PASSWORD: string;
}
