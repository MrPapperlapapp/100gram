import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getMailerConfig } from "@/core/configs/mailer.config";
import { MailService } from "@/shared/libs/mailer/mail.service";
import { BullModule } from "@nestjs/bullmq";
import { MailProcessor } from "@/shared/libs/mailer/mail.processor";

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getMailerConfig,
			inject: [ConfigService]
		}),
		BullModule.registerQueue({ name: "email" })
	],
	providers: [MailService, MailProcessor],
	exports: [MailService]
})
export class MailModule {}
