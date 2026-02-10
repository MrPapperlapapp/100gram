import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "./features/users/user.module";
import { APP_FILTER } from "@nestjs/core";
import { AllHttpExceptionsFilter } from "./core/filters/all-http-exception.filter";
import * as process from "node:process";
import { CqrsModule } from "@nestjs/cqrs";
import { jwtEnv, mailerEnv, pgEnv, recaptchaEnv, redisEnv } from "./core/env";
import { AuthModule } from "./features/auth/auth.module";
import { PrismaModule } from "./shared/libs/prisma";

import { BullModule } from "@nestjs/bullmq";
import { bullmqConfig } from "@/core/configs/bullmq.config";
import { RedisModule } from "@/shared/libs/redis/redis.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [jwtEnv, pgEnv, redisEnv, mailerEnv, recaptchaEnv],
			envFilePath: [
				`.env.${process.env.NODE_ENV || "development"}.local`,
				".env"
			].filter(Boolean)
		}),
		CqrsModule.forRoot(),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: bullmqConfig,
			inject: [ConfigService]
		}),
		PrismaModule,
		RedisModule,
		UserModule,
		AuthModule
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: AllHttpExceptionsFilter
		}
	]
})
export class AppModule {}
