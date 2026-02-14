import { CommandBus } from "@nestjs/cqrs";
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res
} from "@nestjs/common";
import {
	EmailConfirmationRequestDto,
	NewPasswordRequestDto,
	PasswordRecoverRequestDto,
	ResendConfirmationTokenRequestDto,
	SignInRequestDto,
	SignUpUserRequestDto
} from "@/features/auth/dto";
import {
	EmailConfirmationCommand,
	PasswordRecoveryCommand,
	ResendConfirmationCodeCommand,
	SignInCommand,
	SignUpCommand
} from "@/features/auth/application/commands";
import type { Request, Response } from "express";
import { SignInResponseDto } from "@/features/auth/dto/responses/sign-in.response.dto";
import { Protected } from "@/shared/decorators/protected.decorator";
import { Recaptcha } from "@nestlab/google-recaptcha";
import { NewPasswordCommand } from "@/features/auth/application/commands/new-password";
import { SignInSwagger } from "@/features/auth/swagger/sign-in.swagger";
import { SignUpSwagger } from "@/features/auth/swagger/sign-up.swagger";
import { NewPasswordSwagger } from "@/features/auth/swagger/new-password.swagger";
import { PasswordRecoverySwagger } from "@/features/auth/swagger/password-recovery.swagger";
import { EmailConfirmationSwagger } from "@/features/auth/swagger/email-confirmation.swagger";
import { ResendConfirmationSwagger } from "@/features/auth/swagger/resend-confirmation.swagger";

@Controller("auth")
export class AuthController {
	constructor(private readonly commandBus: CommandBus) {}

	@SignUpSwagger()
	@Post("sign-up")
	@HttpCode(HttpStatus.NO_CONTENT)
	async signUp(@Body() dto: SignUpUserRequestDto) {
		return this.commandBus.execute<SignUpCommand, void>(
			new SignUpCommand(dto)
		);
	}

	@EmailConfirmationSwagger()
	@Post("email-confirmation")
	@HttpCode(HttpStatus.NO_CONTENT)
	async emailConfirmation(@Body() { token }: EmailConfirmationRequestDto) {
		return this.commandBus.execute<EmailConfirmationCommand, void>(
			new EmailConfirmationCommand(token)
		);
	}

	@ResendConfirmationSwagger()
	@Recaptcha()
	@Post("email-confirmation-resending")
	@HttpCode(HttpStatus.NO_CONTENT)
	async emailConfirmationResending(
		@Body() { email }: ResendConfirmationTokenRequestDto
	) {
		return this.commandBus.execute<ResendConfirmationCodeCommand, void>(
			new ResendConfirmationCodeCommand(email)
		);
	}

	@SignInSwagger()
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

	@PasswordRecoverySwagger()
	@Post("password-recovery")
	@HttpCode(HttpStatus.NO_CONTENT)
	async passwordRecovery(@Body() { email }: PasswordRecoverRequestDto) {
		return this.commandBus.execute<PasswordRecoveryCommand, void>(
			new PasswordRecoveryCommand(email)
		);
	}

	@NewPasswordSwagger()
	@Post("new-password")
	@HttpCode(HttpStatus.NO_CONTENT)
	async newPassword(@Body() { password, token }: NewPasswordRequestDto) {
		return this.commandBus.execute<NewPasswordCommand, void>(
			new NewPasswordCommand(token, password)
		);
	}

	@Protected()
	@Get("me")
	@HttpCode(HttpStatus.OK)
	getMe(@Req() req: Request) {
		return req.user.id;
	}
}
