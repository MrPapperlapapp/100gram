import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NewPasswordCommand } from "@/features/auth/application/commands/new-password/new-password.command";
import { RedisService } from "@/shared/libs/redis/redis.service";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { HashService } from "@/shared/libs/hash/hash.service";

@CommandHandler(NewPasswordCommand)
export class NewPasswordCommandHandler implements ICommandHandler<
	NewPasswordCommand,
	void
> {
	constructor(
		private readonly redisService: RedisService,
		private readonly userRepository: UserRepository,
		private readonly hashService: HashService
	) {}

	async execute({ password, token }: NewPasswordCommand) {
		const emailFromToken = await this.redisService.get(`recovery:${token}`);
		if (!emailFromToken) {
			throw new BadRequestException(
				"Не валидный код восстановления пароля."
			);
		}

		const user = await this.userRepository.findUserByEmail(emailFromToken);

		if (!user) {
			throw new NotFoundException("Пользователь не найден.");
		}

		const isPassCompare = await this.hashService.comparePass(
			password,
			user.password
		);

		if (isPassCompare) {
			throw new BadRequestException("Пароль не должен совпадать.");
		}

		const hashedPassword = await this.hashService.hashPassword(password);

		await this.userRepository.update(user.id, { password: hashedPassword });

		await this.redisService.del(`recovery:${token}`);
	}
}
