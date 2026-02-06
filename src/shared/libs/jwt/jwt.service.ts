import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { IJwtPayload } from "../../types";

@Injectable()
export class JwtWrapperService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	generateAccessToken(userId: string) {
		return this.jwtService.sign({ userId }, { expiresIn: "15min" });
	}

	generateRefreshToken(userId: string) {
		return this.jwtService.sign({ userId }, { expiresIn: "60min" });
	}

	verify(token: string): IJwtPayload | null {
		try {
			return this.jwtService.verify<IJwtPayload>(token);
		} catch (e) {
			console.log("error", e);
			return null;
		}
	}

	decode(token: string): IJwtPayload | null {
		try {
			return this.jwtService.decode<IJwtPayload>(token);
		} catch (e) {
			console.log("error", e);
			return null;
		}
	}
}
