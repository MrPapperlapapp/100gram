import { INestApplication } from "@nestjs/common";
import { pipesSetup } from "./settings";
import { swaggerSetup } from "./settings/swagger.config";

export function appSetup(app: INestApplication) {
	pipesSetup(app);
	swaggerSetup(app);
}
