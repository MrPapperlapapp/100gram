import { CommandBus } from "@nestjs/cqrs";
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { SignUpUserRequestDto } from "@/features/auth/dto";
import { SignUpCommand } from "@/features/auth/application/commands";

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
}
