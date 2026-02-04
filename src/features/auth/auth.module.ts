import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { getJwtConfig } from "../../core/configs/jwt.config";
import { ConfigService } from "@nestjs/config";

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			useFactory: getJwtConfig,
			inject: [ConfigService]
		})
	]
})
export class AuthModule {}
