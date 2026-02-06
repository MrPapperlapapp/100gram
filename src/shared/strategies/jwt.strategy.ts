import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IAllConfigsInterface } from "@/core/env/interfaces";
import { IJwtPayload } from "@/shared/types";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import { User } from "@prisma/generated/client";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly configService: ConfigService<IAllConfigsInterface>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get("jwt.secret", { infer: true }),
			algorithms: ["HS256"]
		});
	}

	async validate(payload: IJwtPayload): Promise<User> {
		const user = await this.userRepository.findUserById(payload.userId);
		if (!user) throw new NotFoundException("Пользователь не найден.");
		return user;
	}
}
