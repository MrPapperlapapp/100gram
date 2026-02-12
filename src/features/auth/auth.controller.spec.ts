import { AuthController } from "@/features/auth/auth.controller";
import {
	EmailConfirmationCommand,
	NewPasswordCommand,
	PasswordRecoveryCommand,
	ResendConfirmationCodeCommand,
	SignInCommand,
	SignUpCommand
} from "@/features/auth/application/commands";
import {
	BadRequestException,
	ConflictException,
	UnauthorizedException
} from "@nestjs/common";
import type { CommandBus } from "@nestjs/cqrs";
import type { Request, Response } from "express";
import { SignUpUserRequestDto } from "@/features/auth/dto/requests/sign-up-user.request.dto";
import { EmailConfirmationRequestDto } from "@/features/auth/dto/requests/email-confirmation.request.dto";
import { ResendConfirmationTokenRequestDto } from "@/features/auth/dto/requests/resend-confirmation-token.request.dto";
import { SignInRequestDto } from "@/features/auth/dto/requests/sign-in.request.dto";
import { PasswordRecoverRequestDto } from "@/features/auth/dto/requests/password-recover.request.dto";
import { NewPasswordRequestDto } from "@/features/auth/dto/requests/new-password.request.dto";

describe("AuthController", () => {
	let controller: AuthController;
	let commandBus: { execute: jest.Mock };

	beforeEach(() => {
		commandBus = { execute: jest.fn() };
		controller = new AuthController(commandBus as unknown as CommandBus);
	});

	describe("signUp", () => {
		const dto: SignUpUserRequestDto = {
			userName: "newUser",
			email: "user@example.com",
			password: "password123"
		};

		it("успешно отправляет SignUpCommand", async () => {
			commandBus.execute.mockResolvedValue(undefined);

			await expect(controller.signUp(dto)).resolves.toBeUndefined();

			expect(commandBus.execute).toHaveBeenCalledWith(
				expect.any(SignUpCommand)
			);
			const calls = commandBus.execute.mock.calls as [[SignUpCommand]];
			const command = calls[0][0];
			expect(command.dto).toEqual(dto);
		});

		it("пробрасывает ошибку из CommandBus", async () => {
			commandBus.execute.mockRejectedValue(
				new ConflictException("exists")
			);

			await expect(controller.signUp(dto)).rejects.toThrow(
				ConflictException
			);
		});
	});

	describe("emailConfirmation", () => {
		const dto: EmailConfirmationRequestDto = { token: "confirm-token" };

		it("отправляет EmailConfirmationCommand", async () => {
			commandBus.execute.mockResolvedValue(undefined);

			await controller.emailConfirmation(dto);

			expect(commandBus.execute).toHaveBeenCalledWith(
				expect.any(EmailConfirmationCommand)
			);
			const calls = commandBus.execute.mock.calls as [
				[EmailConfirmationCommand]
			];
			expect(calls[0][0].token).toBe(dto.token);
		});

		it("возвращает ошибку при невалидном токене", async () => {
			commandBus.execute.mockRejectedValue(
				new BadRequestException("invalid")
			);

			await expect(controller.emailConfirmation(dto)).rejects.toThrow(
				BadRequestException
			);
		});
	});

	describe("emailConfirmationResending", () => {
		const dto: ResendConfirmationTokenRequestDto = {
			email: "resend@example.com"
		};

		it("успешно отправляет ResendConfirmationCodeCommand", async () => {
			commandBus.execute.mockResolvedValue(undefined);

			await controller.emailConfirmationResending(dto);

			expect(commandBus.execute).toHaveBeenCalledWith(
				expect.any(ResendConfirmationCodeCommand)
			);
			const calls = commandBus.execute.mock.calls as [
				[ResendConfirmationCodeCommand]
			];
			expect(calls[0][0].email).toBe(dto.email);
		});

		it("пробрасывает ошибку из CommandBus", async () => {
			commandBus.execute.mockRejectedValue(
				new BadRequestException("rate-limit")
			);

			await expect(
				controller.emailConfirmationResending(dto)
			).rejects.toThrow(BadRequestException);
		});
	});

	describe("signInS", () => {
		const dto: SignInRequestDto = {
			email: "login@example.com",
			password: "secret123"
		};

		it("возвращает accessToken и ставит refresh куку", async () => {
			commandBus.execute.mockResolvedValue({
				accessToken: "access-token",
				refreshToken: "refresh-token"
			});
			const cookieFn = jest.fn();
			const res = { cookie: cookieFn } as unknown as Response;

			const result = await controller.signInS(dto, res);

			expect(commandBus.execute).toHaveBeenCalledWith(
				expect.any(SignInCommand)
			);
			expect(cookieFn).toHaveBeenCalledWith("refresh", "refresh-token", {
				httpOnly: true,
				secure: true,
				maxAge: 60 * 60 * 1000
			});
			expect(result).toEqual({ accessToken: "access-token" });
		});

		it("пробрасывает UnauthorizedException при ошибке аутентификации", async () => {
			commandBus.execute.mockRejectedValue(
				new UnauthorizedException("Unauthorized")
			);
			const res = { cookie: jest.fn() } as unknown as Response;

			await expect(controller.signInS(dto, res)).rejects.toThrow(
				UnauthorizedException
			);
		});
	});

	describe("passwordRecovery", () => {
		const dto: PasswordRecoverRequestDto = { email: "forgot@example.com" };

		it("делегирует PasswordRecoveryCommand", async () => {
			commandBus.execute.mockResolvedValue(undefined);

			await controller.passwordRecovery(dto);

			expect(commandBus.execute).toHaveBeenCalledWith(
				expect.any(PasswordRecoveryCommand)
			);
		});

		it("пробрасывает ошибку при неуспехе", async () => {
			commandBus.execute.mockRejectedValue(
				new BadRequestException("bad")
			);

			await expect(controller.passwordRecovery(dto)).rejects.toThrow(
				BadRequestException
			);
		});
	});

	describe("newPassword", () => {
		const dto: NewPasswordRequestDto = {
			password: "newPass123",
			token: "recovery-token"
		};

		it("делегирует NewPasswordCommand", async () => {
			commandBus.execute.mockResolvedValue(undefined);

			await controller.newPassword(dto);

			expect(commandBus.execute).toHaveBeenCalledWith(
				expect.any(NewPasswordCommand)
			);
			const calls = commandBus.execute.mock.calls as [
				[NewPasswordCommand]
			];
			expect(calls[0][0].token).toBe(dto.token);
		});

		it("пробрасывает ошибку из CommandBus", async () => {
			commandBus.execute.mockRejectedValue(
				new BadRequestException("bad token")
			);

			await expect(controller.newPassword(dto)).rejects.toThrow(
				BadRequestException
			);
		});
	});

	describe("getMe", () => {
		it("возвращает id пользователя из запроса", () => {
			const req = { user: { id: "user-id-1" } } as Request;
			expect(controller.getMe(req)).toBe("user-id-1");
		});
	});
});
