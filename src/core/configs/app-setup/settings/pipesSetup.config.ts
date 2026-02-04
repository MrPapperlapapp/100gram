import { INestApplication, ValidationPipe } from "@nestjs/common";

export function pipesSetup(app: INestApplication) {
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			stopAtFirstError: true
		})
	);
}
