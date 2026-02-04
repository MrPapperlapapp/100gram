import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./features/users/user.module";
import { APP_FILTER } from "@nestjs/core";
import { AllHttpExceptionsFilter } from "./core/filters/all-http-exception.filter";

@Module({
	imports: [ConfigModule.forRoot(), UserModule],
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
