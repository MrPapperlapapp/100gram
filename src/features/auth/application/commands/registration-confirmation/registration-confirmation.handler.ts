import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RegistrationConfirmationCommand } from "@/features/auth/application/commands/registration-confirmation/registration-confirmation.command";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import { RedisService } from "@/shared/libs/redis/redis.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationCommandHandler implements ICommandHandler<
	RegistrationConfirmationCommand,
	void
> {
	constructor(
		private readonly redis: RedisService,
		private readonly userRepository: UserRepository
	) {}

	async execute({ token }: RegistrationConfirmationCommand): Promise<void> {
		const isTokenExist = await this.redis.get(`confirmation:${token}`);
		if (!isTokenExist) {
			throw new BadRequestException("Не валидный токен.");
		}

		const updateRes =
			await this.userRepository.userConfirmationById(isTokenExist);

		if (!updateRes) {
			throw new NotFoundException("Пользователь не найден.");
		}
		await this.redis.del(`confirmation:${token}`);
	}
}
