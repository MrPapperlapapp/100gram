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

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [jwtEnv],
			envFilePath: [
				`.env.${process.env.NODE_ENV || "development"}.local`,
				".env"
			].filter(Boolean)
		}),
		CqrsModule.forRoot(),
		UserModule
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
