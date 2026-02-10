import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PasswordRecoveryCommand } from "./password-recovery.command";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import { RedisService } from "@/shared/libs/redis/redis.service";
import { randomUUID } from "crypto";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryCommandHandler implements ICommandHandler<
	PasswordRecoveryCommand,
	void
> {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly redisService: RedisService,
		@InjectQueue("email") private readonly mailQueue: Queue
	) {}

	async execute({ email }: PasswordRecoveryCommand) {
		const isUserExist = await this.userRepository.findUserByEmail(email);
		if (!isUserExist) return;

		const token = randomUUID();

		await this.redisService.set(`recovery:${token}`, email, "EX", 300);

		await this.mailQueue.add("send-email", {
			email,
			token,
			subject: "Сброс пароля",
			template: "password-recovery"
		});
	}
}
