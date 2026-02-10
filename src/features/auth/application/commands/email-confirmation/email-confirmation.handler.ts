import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EmailConfirmationCommand } from "@/features/auth/application/commands/email-confirmation/email-confirmation.command";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import { RedisService } from "@/shared/libs/redis/redis.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

@CommandHandler(EmailConfirmationCommand)
export class RegistrationConfirmationCommandHandler implements ICommandHandler<
	EmailConfirmationCommand,
	void
> {
	constructor(
		private readonly redis: RedisService,
		private readonly userRepository: UserRepository
	) {}

	async execute({ token }: EmailConfirmationCommand): Promise<void> {
		const emailFromToken = await this.redis.get(`confirmation:${token}`);
		if (!emailFromToken) {
			throw new BadRequestException("Не валидный токен.");
		}

		const updateRes =
			await this.userRepository.userConfirmationById(emailFromToken);

		if (!updateRes) {
			throw new NotFoundException("Пользователь не найден.");
		}
		await this.redis.del(`confirmation:${token}`);
	}
}
