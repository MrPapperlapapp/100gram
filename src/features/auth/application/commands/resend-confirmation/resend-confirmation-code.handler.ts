import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResendConfirmationCodeCommand } from "./resend-confirmation-code.command";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import { RedisService } from "@/shared/libs/redis/redis.service";
import { randomUUID } from "crypto";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeCommandHandler implements ICommandHandler<
	ResendConfirmationCodeCommand,
	void
> {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly redisService: RedisService,
		@InjectQueue("email") private readonly mailQueue: Queue
	) {}

	async execute({ email }: ResendConfirmationCodeCommand) {
		const isUserExist = await this.userRepository.findUserByEmail(email);
		if (!isUserExist || isUserExist.isConfirmed) return;

		const token = randomUUID();

		await Promise.all([
			this.redisService.set(
				`confirmation:${token}`,
				isUserExist.id,
				"EX",
				300
			),

			this.mailQueue.add("send-email", {
				email,
				token,
				subject: "Подтверждение регистрации",
				template: "confirmation"
			})
		]);
	}
}
