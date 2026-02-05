import {
	Injectable,
	OnModuleInit,
	OnModuleDestroy,
	Logger
} from "@nestjs/common";
import { PrismaClient } from "prisma/generated/client";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { IAllConfigsInterface } from "@/core/env/interfaces";

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name);

	constructor(
		private readonly configService: ConfigService<IAllConfigsInterface>
	) {
		const adapter = new PrismaPg({
			user: configService.get<string>("pg.user", {
				infer: true
			}),
			password: configService.get<string>("pg.password", { infer: true }),
			host: configService.get<string>("pg.host", { infer: true }),
			port: configService.get<string>("pg.port", { infer: true }),
			database: configService.get<string>("pg.database", { infer: true })
		});

		super({ adapter });
	}

	async onModuleInit() {
		this.logger.log("Инициализация подключения к Prisma");
		try {
			await this.$connect();
			this.logger.log("Подключен к Prisma");
		} catch (e) {
			this.logger.error("Ошибка подключения к Prisma", e);
			//TODO
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			throw new e();
		}
	}

	async onModuleDestroy() {
		this.logger.log("Отключение от Prisma");
		try {
			await this.$disconnect();
			this.logger.log("Отключён от Prisma");
		} catch (e) {
			this.logger.error("Ошибка отключение от Prisma", e);
		}
	}
}
