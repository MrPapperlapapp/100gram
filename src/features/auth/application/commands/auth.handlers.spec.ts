import {
	RegistrationConfirmationCommandHandler,
	PasswordRecoveryCommandHandler,
	SignUpCommandHandler,
	NewPasswordCommandHandler
} from "@/features/auth/application";
import {
	EmailConfirmationCommand,
	NewPasswordCommand,
	PasswordRecoveryCommand,
	SignUpCommand
} from "@/features/auth/application/commands";
import { HashService } from "@/shared/libs/hash/hash.service";
import { RedisService } from "@/shared/libs/redis/redis.service";
import { UserRepository } from "@/features/users/infrastructure/user.repository";
import {
	BadRequestException,
	ConflictException,
	NotFoundException
} from "@nestjs/common";
import { Queue } from "bullmq";
import { SignUpUserRequestDto } from "@/features/auth/dto/requests/sign-up-user.request.dto";

describe("Auth command handlers (Redis & mail mocks)", () => {
	let redis: { set: jest.Mock; get: jest.Mock; del: jest.Mock };
	let userRepo: {
		findUserByEmail: jest.Mock;
		findUserByName: jest.Mock;
		create: jest.Mock;
		userConfirmationById: jest.Mock;
		update: jest.Mock;
	};
	let hashService: { hashPassword: jest.Mock; comparePass: jest.Mock };
	let mailQueue: { add: jest.Mock };

	beforeEach(() => {
		redis = { set: jest.fn(), get: jest.fn(), del: jest.fn() };
		userRepo = {
			findUserByEmail: jest.fn(),
			findUserByName: jest.fn(),
			create: jest.fn(),
			userConfirmationById: jest.fn(),
			update: jest.fn()
		};
		hashService = {
			hashPassword: jest.fn(),
			comparePass: jest.fn()
		};
		mailQueue = { add: jest.fn() };
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("SignUpCommandHandler", () => {
		it("записывает токен в Redis и ставит задачу на отправку письма", async () => {
			const handler = new SignUpCommandHandler(
				userRepo as unknown as UserRepository,
				hashService as unknown as HashService,
				redis as unknown as RedisService,
				mailQueue as unknown as Queue
			);
			userRepo.findUserByEmail.mockResolvedValue(null);
			userRepo.findUserByName.mockResolvedValue(null);
			userRepo.create.mockResolvedValue("user-1");
			hashService.hashPassword.mockResolvedValue("hashed-pass");

			const dto: SignUpUserRequestDto = {
				userName: "u1",
				email: "u1@example.com",
				password: "pass123"
			};
			await handler.execute(new SignUpCommand(dto));

			expect(redis.set).toHaveBeenCalledTimes(1);
			const calls = redis.set.mock.calls as [
				[string, string, string, number]
			];
			const [key, value, ex, ttl] = calls[0];
			expect(key).toMatch(/^confirmation:/);
			expect(value).toBe("user-1");
			expect(ex).toBe("EX");
			expect(ttl).toBe(300);
			const token = key.replace("confirmation:", "");
			expect(mailQueue.add).toHaveBeenCalledWith("send-email", {
				email: "u1@example.com",
				token,
				subject: "Подтверждение регистрации",
				template: "confirmation"
			});
		});

		it("бросает ConflictException если email уже существует", async () => {
			const handler = new SignUpCommandHandler(
				userRepo as unknown as UserRepository,
				hashService as unknown as HashService,
				redis as unknown as RedisService,
				mailQueue as unknown as Queue
			);
			userRepo.findUserByEmail.mockResolvedValue({ id: "1" });

			const dto: SignUpUserRequestDto = {
				userName: "u1",
				email: "u1@example.com",
				password: "pass123"
			};
			await expect(
				handler.execute(new SignUpCommand(dto))
			).rejects.toThrow(ConflictException);
			expect(redis.set).not.toHaveBeenCalled();
			expect(mailQueue.add).not.toHaveBeenCalled();
		});

		it("бросает ConflictException если username уже существует", async () => {
			const handler = new SignUpCommandHandler(
				userRepo as unknown as UserRepository,
				hashService as unknown as HashService,
				redis as unknown as RedisService,
				mailQueue as unknown as Queue
			);
			userRepo.findUserByEmail.mockResolvedValue(null);
			userRepo.findUserByName.mockResolvedValue({ id: "1" });

			const dto: SignUpUserRequestDto = {
				userName: "u1",
				email: "u1@example.com",
				password: "pass123"
			};
			await expect(
				handler.execute(new SignUpCommand(dto))
			).rejects.toThrow(ConflictException);
			expect(redis.set).not.toHaveBeenCalled();
			expect(mailQueue.add).not.toHaveBeenCalled();
		});
	});

	describe("RegistrationConfirmationCommandHandler", () => {
		it("удаляет токен после успешного подтверждения", async () => {
			const handler = new RegistrationConfirmationCommandHandler(
				redis as unknown as RedisService,
				userRepo as unknown as UserRepository
			);
			redis.get.mockResolvedValue("user-1");
			userRepo.userConfirmationById.mockResolvedValue({ id: "user-1" });

			await handler.execute(new EmailConfirmationCommand("token-1"));

			expect(redis.del).toHaveBeenCalledWith("confirmation:token-1");
		});

		it("вызывает BadRequestException при неверном токене", async () => {
			const handler = new RegistrationConfirmationCommandHandler(
				redis as unknown as RedisService,
				userRepo as unknown as UserRepository
			);
			redis.get.mockResolvedValue(null);

			await expect(
				handler.execute(new EmailConfirmationCommand("bad-token"))
			).rejects.toThrow(BadRequestException);
		});

		it("вызывает NotFoundException если пользователь не найден", async () => {
			const handler = new RegistrationConfirmationCommandHandler(
				redis as unknown as RedisService,
				userRepo as unknown as UserRepository
			);
			redis.get.mockResolvedValue("user-1");
			userRepo.userConfirmationById.mockResolvedValue(null);

			await expect(
				handler.execute(new EmailConfirmationCommand("token-1"))
			).rejects.toThrow(NotFoundException);
		});
	});

	describe("PasswordRecoveryCommandHandler", () => {
		it("кладет токен восстановления в Redis и задачу на почту", async () => {
			const handler = new PasswordRecoveryCommandHandler(
				userRepo as unknown as UserRepository,
				redis as unknown as RedisService,
				mailQueue as unknown as Queue
			);
			userRepo.findUserByEmail.mockResolvedValue({ id: "1" });

			await handler.execute(
				new PasswordRecoveryCommand("user@example.com")
			);

			expect(redis.set).toHaveBeenCalledTimes(1);
			const calls = redis.set.mock.calls as [
				[string, string, string, number]
			];
			const [key, email, ex, ttl] = calls[0];
			expect(key).toMatch(/^recovery:/);
			expect(email).toBe("user@example.com");
			expect(ex).toBe("EX");
			expect(ttl).toBe(300);
			const token = key.replace("recovery:", "");
			expect(mailQueue.add).toHaveBeenCalledWith("send-email", {
				email: "user@example.com",
				token,
				subject: "Сброс пароля",
				template: "password-recovery"
			});
		});

		it("ничего не делает если пользователь не найден", async () => {
			const handler = new PasswordRecoveryCommandHandler(
				userRepo as unknown as UserRepository,
				redis as unknown as RedisService,
				mailQueue as unknown as Queue
			);
			userRepo.findUserByEmail.mockResolvedValue(null);

			await handler.execute(
				new PasswordRecoveryCommand("missing@example.com")
			);

			expect(redis.set).not.toHaveBeenCalled();
			expect(mailQueue.add).not.toHaveBeenCalled();
		});
	});

	describe("NewPasswordCommandHandler", () => {
		it("вызывает BadRequestException при неверном токене", async () => {
			const handler = new NewPasswordCommandHandler(
				redis as unknown as RedisService,
				userRepo as unknown as UserRepository,
				hashService as unknown as HashService
			);
			redis.get.mockResolvedValue(null);

			await expect(
				handler.execute(
					new NewPasswordCommand("bad-token", "new-pass-1")
				)
			).rejects.toThrow(BadRequestException);
		});

		it("вызывает NotFoundException если пользователь не найден", async () => {
			const handler = new NewPasswordCommandHandler(
				redis as unknown as RedisService,
				userRepo as unknown as UserRepository,
				hashService as unknown as HashService
			);
			redis.get.mockResolvedValue("user@example.com");
			userRepo.findUserByEmail.mockResolvedValue(null);

			await expect(
				handler.execute(new NewPasswordCommand("token-1", "new-pass"))
			).rejects.toThrow(NotFoundException);
		});

		it("вызывает BadRequestException если пароль совпадает", async () => {
			const handler = new NewPasswordCommandHandler(
				redis as unknown as RedisService,
				userRepo as unknown as UserRepository,
				hashService as unknown as HashService
			);
			redis.get.mockResolvedValue("user@example.com");
			userRepo.findUserByEmail.mockResolvedValue({
				id: "1",
				password: "hashed-old"
			});
			hashService.comparePass.mockResolvedValue(true);

			await expect(
				handler.execute(new NewPasswordCommand("token-1", "same-pass"))
			).rejects.toThrow(BadRequestException);
			expect(userRepo.update).not.toHaveBeenCalled();
		});

		it("обновляет пароль и удаляет токен из Redis", async () => {
			const handler = new NewPasswordCommandHandler(
				redis as unknown as RedisService,
				userRepo as unknown as UserRepository,
				hashService as unknown as HashService
			);
			redis.get.mockResolvedValue("user@example.com");
			userRepo.findUserByEmail.mockResolvedValue({
				id: "1",
				password: "old-hash"
			});
			hashService.comparePass.mockResolvedValue(false);
			hashService.hashPassword.mockResolvedValue("new-hash");

			await handler.execute(
				new NewPasswordCommand("token-1", "new-pass")
			);

			expect(userRepo.update).toHaveBeenCalledWith("1", {
				password: "new-hash"
			});
			expect(redis.del).toHaveBeenCalledWith("recovery:token-1");
		});
	});
});
