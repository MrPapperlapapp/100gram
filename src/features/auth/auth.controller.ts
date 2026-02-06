import { CommandBus } from "@nestjs/cqrs";
import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Res
} from "@nestjs/common";
import {
	EmailConfirmationRequestDto,
	SignInRequestDto,
	SignUpUserRequestDto
} from "@/features/auth/dto";
import {
	RegistrationConfirmationCommand,
	SignInCommand,
	SignUpCommand
} from "@/features/auth/application/commands";
import type { Response } from "express";
import { SignInResponseDto } from "@/features/auth/dto/responses/sign-in.response.dto";

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

	@Post("sign-in")
	@HttpCode(HttpStatus.OK)
	async signInS(
		@Body() dto: SignInRequestDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { password, email } = dto;
		const { refreshToken, accessToken } = await this.commandBus.execute<
			SignInCommand,
			SignInResponseDto & { refreshToken: string }
		>(new SignInCommand(email, password));

		res.cookie("refresh", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 60 * 60 * 1000
		});

		return { accessToken };
	}
}
