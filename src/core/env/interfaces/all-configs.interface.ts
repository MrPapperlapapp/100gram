import { IJwtConfig } from "./jwt.interface";
import { IPgAdapterConfig } from "@/core/env/interfaces/pg-adapter.interface";
import { IRedisConfig } from "@/core/env/interfaces/redis.interface";
import { IMailerConfig } from "@/core/env/interfaces/mailer.interface";
import { IRecaptchaConfig } from "@/core/env/interfaces/recaptcha.interface";

export interface IAllConfigsInterface {
	jwt: IJwtConfig;
	pg: IPgAdapterConfig;
	redis: IRedisConfig;
	mailer: IMailerConfig;
	recaptcha: IRecaptchaConfig;
}
