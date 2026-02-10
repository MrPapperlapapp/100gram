import { ConfigService } from "@nestjs/config";
import { IAllConfigsInterface } from "@/core/env/interfaces";
import { GoogleRecaptchaModuleOptions } from "@nestlab/google-recaptcha";
import { isDev } from "@/shared/utils/is-dev.util";
import { Request } from "express";

export const recaptchaConfig = (
	configService: ConfigService<IAllConfigsInterface>
): GoogleRecaptchaModuleOptions => ({
	secretKey: configService.get("recaptcha.secret", { infer: true }),
	response: (req: Request) =>
		req.headers.recaptcha as string | Promise<string>,
	skipIf: isDev(configService)
});
