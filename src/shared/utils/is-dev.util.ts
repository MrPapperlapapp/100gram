import { ConfigService } from "@nestjs/config";

export function isDev(configService: ConfigService<any, any>): boolean {
	return configService.getOrThrow<string>("NODE_ENV") === "development";
}
