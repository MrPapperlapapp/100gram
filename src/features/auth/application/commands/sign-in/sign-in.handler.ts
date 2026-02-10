import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SignInCommand } from "@/features/auth/application/commands/sign-in/sign-in.command";
import { SignInResponseDto } from "@/features/auth/dto/responses/sign-in.response.dto";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import { UnauthorizedException } from "@nestjs/common";
import { HashService } from "@/shared/libs/hash/hash.service";
import { JwtWrapperService } from "@/shared/libs/jwt/jwt.service";

@CommandHandler(SignInCommand)
export class SignInCommandHandler implements ICommandHandler<
	SignInCommand,
	SignInResponseDto & { refreshToken: string }
> {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly hashService: HashService,
		private readonly jwtService: JwtWrapperService
	) {}

	async execute({ password, email }: SignInCommand) {
		const user = await this.userRepository.findUserByEmail(email);
		if (!user || !user.isConfirmed) {
			throw new UnauthorizedException("Unauthorized");
		}

		const isValidPass = await this.hashService.comparePass(
			password,
			user.password
		);
		if (!isValidPass) {
			throw new UnauthorizedException("Unauthorized");
		}

		const accessToken = this.jwtService.generateAccessToken(user.id);
		const refreshToken = this.jwtService.generateRefreshToken(user.id);

		return { refreshToken, accessToken };
	}
}
