import { ConfigService } from "@nestjs/config";
import { MailerOptions } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from "path";
import { IAllConfigsInterface } from "@/core/env/interfaces";

export function getMailerConfig(
	configService: ConfigService<IAllConfigsInterface>
): MailerOptions {
	return {
		transport: {
			host: configService.get<string>("mailer.host", { infer: true }),
			port: configService.get<string>("mailer.port", { infer: true }),
			secure: true,
			tls: {
				rejectUnauthorized: false
			},
			auth: {
				user: configService.get<string>("mailer.user", { infer: true }),
				pass: configService.get<string>("mailer.pass", { infer: true })
			}
		},
		defaults: {
			from: configService.get<string>("mailer.user", { infer: true })
		},
		template: {
			dir: join(
				__dirname,
				"..",
				"..",
				"shared",
				"libs",
				"mailer",
				"templates"
			),
			adapter: new HandlebarsAdapter(),
			options: {
				strict: true
			}
		}
	};
}
