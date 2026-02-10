import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { ConfigModule, ConfigService } from "@nestjs/config";
import { getJwtConfig } from "@/core/configs/jwt.config";
import { AuthController } from "@/features/auth/auth.controller";
import { UserModule } from "@/features/users/user.module";

import { HashModule } from "@/shared/libs/hash/hash.module";
import { MailModule } from "@/shared/libs/mailer/mail.module";
import { BullModule } from "@nestjs/bullmq";
import {
	RegistrationConfirmationCommandHandler,
	SignUpCommandHandler,
	SignInCommandHandler,
	ResendConfirmationCodeCommandHandler,
	PasswordRecoveryCommandHandler,
	NewPasswordCommandHandler
} from "@/features/auth/application";
import { JwtWrapperModule } from "@/shared/libs/jwt/jwt.module";
import { JwtStrategy } from "@/shared/strategies";
import { GoogleRecaptchaModule } from "@nestlab/google-recaptcha";
import { recaptchaConfig } from "@/core/configs/recaptcha.config";

const commands = [
	SignUpCommandHandler,
	RegistrationConfirmationCommandHandler,
	SignInCommandHandler,
	ResendConfirmationCodeCommandHandler,
	PasswordRecoveryCommandHandler,
	NewPasswordCommandHandler
];

@Module({
	imports: [
		PassportModule,
		GoogleRecaptchaModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: recaptchaConfig,
			inject: [ConfigService]
		}),
		BullModule.registerQueue({ name: "email" }),
		JwtModule.registerAsync({
			useFactory: getJwtConfig,
			inject: [ConfigService]
		}),
		HashModule,
		JwtWrapperModule,
		MailModule,
		UserModule
	],
	providers: [...commands, JwtStrategy],
	controllers: [AuthController]
})
export class AuthModule {}
