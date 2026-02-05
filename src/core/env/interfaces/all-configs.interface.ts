import { IJwtConfig } from "./jwt.interface";
import { IPgAdapter } from "@/core/env/interfaces/pg-adapter.interface";
import { IRedisInterface } from "@/core/env/interfaces/redis.interface";
import { IMailerInterface } from "@/core/env/interfaces/mailer.interface";

export interface IAllConfigsInterface {
	jwt: IJwtConfig;
	pg: IPgAdapter;
	redis: IRedisInterface;
	mailer: IMailerInterface;
}
