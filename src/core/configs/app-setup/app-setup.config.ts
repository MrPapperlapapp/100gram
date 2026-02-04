import { INestApplication } from "@nestjs/common";
import { pipesSetup } from "./settings";

export function appSetup(app: INestApplication) {
	pipesSetup(app);
}
