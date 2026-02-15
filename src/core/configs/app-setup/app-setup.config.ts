import { INestApplication } from "@nestjs/common";
import { pipesSetup } from "./settings";
import { swaggerSetup } from "./settings/swagger.config";

export function appSetup(app: INestApplication) {
	app.enableCors({
		origin: [
			"http://localhost:3000",
			"http://95.81.100.95",
		],
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	});
	pipesSetup(app);
	swaggerSetup(app);
}
