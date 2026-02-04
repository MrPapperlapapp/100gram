import { CommandBus } from "@nestjs/cqrs";
import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

@Controller("auth")
export class AuthController {
	constructor(private readonly commandBus: CommandBus) {}

	@Post("sign-up")
	@HttpCode(HttpStatus.NO_CONTENT)
	async signUp() {}
}
