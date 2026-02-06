import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { ConfigService } from "@nestjs/config";
import { getJwtConfig } from "@/core/configs/jwt.config";
import { AuthController } from "@/features/auth/auth.controller";
import { UserModule } from "@/features/users/user.module";

import { HashModule } from "@/shared/libs/hash/hash.module";
import { MailModule } from "@/shared/libs/mailer/mail.module";
import { BullModule } from "@nestjs/bullmq";
import {
	RegistrationConfirmationCommandHandler,
	SignUpCommandHandler
} from "@/features/auth/application";

const commands = [SignUpCommandHandler, RegistrationConfirmationCommandHandler];

@Module({
	imports: [
		PassportModule,
		BullModule.registerQueue({ name: "email" }),
		JwtModule.registerAsync({
			useFactory: getJwtConfig,
			inject: [ConfigService]
		}),
		HashModule,
		MailModule,
		UserModule
	],
	providers: [...commands],
	controllers: [AuthController]
})
export class AuthModule {}
