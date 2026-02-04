import { ConfigService } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";
import { IAllConfigsInterface } from "../env/interfaces";

export function getJwtConfig(
	configService: ConfigService<IAllConfigsInterface>
): JwtModuleOptions {
	return {
		secret: configService.get("jwt.secret", { infer: true }),
		signOptions: {
			algorithm: "HS256"
		}
	};
}
