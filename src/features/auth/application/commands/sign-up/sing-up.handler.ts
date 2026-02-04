import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SignUpCommand } from "@/features/auth/application/commands/sign-up/sign-up.command";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import { ConflictException } from "@nestjs/common";

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<
	SignUpCommand,
	void
> {
	constructor(private readonly userRepository: UserRepository) {}

	async execute({ dto: { userName, email } }: SignUpCommand) {
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
	}
}
