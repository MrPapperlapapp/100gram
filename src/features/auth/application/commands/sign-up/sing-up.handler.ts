import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import { ConflictException } from "@nestjs/common";
import { HashService } from "@/shared/libs/hash/hash.service";
import { RedisService } from "@/shared/libs/redis/redis.service";
import { randomUUID } from "crypto";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { SignUpCommand } from "./sign-up.command";

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<
	SignUpCommand,
	void
> {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly hashService: HashService,
		private readonly redisService: RedisService,
		@InjectQueue("email") private readonly mailQueue: Queue
	) {}

	async execute({ dto: { userName, email, password } }: SignUpCommand) {
		const isEmailExist = await this.userRepository.findUserByEmail(email);
		if (isEmailExist) {
			throw new ConflictException(
				"Пользователь с таким email существует."
			);
		}

		const isUserNameExist =
			await this.userRepository.findUserByName(userName);
		if (isUserNameExist) {
			throw new ConflictException(
				"Пользователь с таким username существует."
			);
		}

		const hashedPassword = await this.hashService.hashPassword(password);

		const userId = await this.userRepository.create({
			userName,
			email,
			password: hashedPassword
		});

		const token = randomUUID();

		await this.redisService.set(`confirmation:${token}`, userId, "EX", 300);

		await this.mailQueue.add("send-email", {
			email,
			token,
			subject: "Подтверждение регистрации",
			template: "confirmation"
		});
	}
}
