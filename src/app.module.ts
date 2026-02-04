import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./features/users/user.module";
import { APP_FILTER } from "@nestjs/core";
import { AllHttpExceptionsFilter } from "./core/filters/all-http-exception.filter";
import * as process from "node:process";
import { CqrsModule } from "@nestjs/cqrs";
import { jwtEnv } from "./core/env";
import { AuthModule } from "./features/auth/auth.module";
import { PrismaModule } from "./shared/libs/prisma";
import { pgEnv } from "@/core/env/pg.env";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [jwtEnv, pgEnv],
			envFilePath: [
				`.env.${process.env.NODE_ENV || "development"}.local`,
				".env"
			].filter(Boolean)
		}),
		CqrsModule.forRoot(),
		PrismaModule,
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
