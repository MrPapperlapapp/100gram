import { CommandBus } from "@nestjs/cqrs";
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
	EmailConfirmationRequestDto,
	SignUpUserRequestDto
} from "@/features/auth/dto";
import {
	RegistrationConfirmationCommand,
	SignUpCommand
} from "@/features/auth/application/commands";

@Controller("auth")
export class AuthController {
	constructor(private readonly commandBus: CommandBus) {}

	@Post("sign-up")
	@HttpCode(HttpStatus.NO_CONTENT)
	async signUp(@Body() dto: SignUpUserRequestDto) {
		return this.commandBus.execute<SignUpCommand, void>(
			new SignUpCommand(dto)
		);
	}

	@Post("email-confirmation")
	@HttpCode(HttpStatus.NO_CONTENT)
	async emailConfirmation(@Body() { token }: EmailConfirmationRequestDto) {
		return this.commandBus.execute<RegistrationConfirmationCommand, void>(
			new RegistrationConfirmationCommand(token)
		);
	}
}
