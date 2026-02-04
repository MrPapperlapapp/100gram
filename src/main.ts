import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { appSetup } from "./core/configs/app-setup/app-setup.config";
import cookieParser from "cookie-parser";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	appSetup(app);
	app.use(cookieParser());
	await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
