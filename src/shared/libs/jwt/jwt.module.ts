import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { getJwtConfig } from "@/core/configs/jwt.config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtWrapperService } from "@/shared/libs/jwt/jwt.service";

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: getJwtConfig,
			inject: [ConfigService]
		})
	],
	providers: [JwtWrapperService],
	exports: [JwtWrapperService]
})
export class JwtWrapperModule {}
