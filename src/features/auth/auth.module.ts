import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { ConfigService } from "@nestjs/config";
import { getJwtConfig } from "@/core/configs/jwt.config";
import { AuthController } from "@/features/auth/auth.controller";
import { UserModule } from "@/features/users/user.module";

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			useFactory: getJwtConfig,
			inject: [ConfigService]
		}),
		UserModule
	],
	controllers: [AuthController]
})
export class AuthModule {}
