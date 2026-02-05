import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IAllConfigsInterface } from "@/core/env/interfaces";
import Redis from "ioredis";

@Injectable()
export class RedisService
	extends Redis
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(RedisService.name);

	constructor(
		private readonly configService: ConfigService<IAllConfigsInterface>
	) {
		super({
			username: configService.get("redis.user", { infer: true }),
			password: configService.get("redis.pass", { infer: true }),
			host: configService.get("redis.host", { infer: true }),
			port: configService.get("redis.port", { infer: true }),
			maxRetriesPerRequest: 5,
			enableOfflineQueue: true
		});
	}

	onModuleInit() {
		this.logger.log("Инициализация Redis");

		this.on("connect", () => {
			this.logger.log("Подключение к Redis...");
		});

		this.on("ready", () => {
			this.logger.log("Успешное подключение к Redis");
		});

		this.on("error", (err) => {
			this.logger.error("Redis error", {
				error: err.message || err
			});
		});

		this.on("close", () => {
			this.logger.warn("Соединение с Redis закрыто");
		});

		this.on("reconnecting", () => {
			this.logger.log("Переподключение к Redis");
		});
	}

	async onModuleDestroy() {
		this.logger.log("Закрытие подключение к Redis");
		try {
			await this.quit();
			this.logger.log("Соединение с Redis закрыто");
		} catch (err: unknown) {
			this.logger.error("Redis error", {
				error: err instanceof Error ? err.message : err
			});
		}
	}
}
