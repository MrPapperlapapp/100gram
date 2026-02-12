/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { RedisService } from "@/shared/libs/redis/redis.service";
import { PrismaService } from "@/shared/libs/prisma";
import { MailService } from "@/shared/libs/mailer/mail.service";
import { getQueueToken } from "@nestjs/bullmq";
import { Queue } from "bullmq";

type HttpServer = ReturnType<INestApplication["getHttpServer"]>;

describe("Auth e2e (real Redis/Bull, mail send mocked)", () => {
	let app: INestApplication;
	let redis: RedisService;
	let prisma: PrismaService;
	let mailServiceMock: { sendMail: jest.Mock };
	let mailQueue: Queue;
	let httpServer: HttpServer;

	beforeAll(async () => {
		mailServiceMock = { sendMail: jest.fn().mockResolvedValue(undefined) };

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		})
			.overrideProvider(MailService)
			.useValue(mailServiceMock)
			.compile();

		app = moduleFixture.createNestApplication();
		await app.init();
		httpServer = app.getHttpServer();

		prisma = app.get(PrismaService);
		redis = app.get(RedisService);
		mailQueue = app.get(getQueueToken("email"));
	});

	afterAll(async () => {
		if (app) await app.close();
	});

	beforeEach(async () => {
		mailServiceMock.sendMail.mockClear();
		// очистка очереди и ключей redis
		const keys = await redis.keys("*");
		if (keys.length) {
			await redis.del(...keys);
		}
		await prisma.user.deleteMany();
		// очищаем очередь email (если сохраняются задания)
		if (mailQueue) {
			await mailQueue.drain(true);
			await mailQueue.clean(0, 1000, "wait");
			await mailQueue.clean(0, 1000, "delayed");
			await mailQueue.clean(0, 1000, "active");
			await mailQueue.clean(0, 1000, "completed");
			await mailQueue.clean(0, 1000, "failed");
		}
	});

	it("полный флоу: sign-up -> email-confirmation -> sign-in -> recovery -> new-password", async () => {
		const signUpDto = {
			userName: "user1",
			email: "user1@example.com",
			password: "Password1"
		};

		// sign-up
		await request(httpServer)
			.post("/auth/sign-up")
			.send(signUpDto)
			.expect(204);

		const confirmationKeys = await redis.keys("confirmation:*");
		expect(confirmationKeys.length).toBe(1);

		const confirmationKey = confirmationKeys[0];
		const confirmationToken = confirmationKey.replace("confirmation:", "");

		// email-confirmation
		await request(httpServer)
			.post("/auth/email-confirmation")
			.send({ token: confirmationToken })
			.expect(204);

		expect(await redis.keys("confirmation:*")).toHaveLength(0);

		// sign-in (старый пароль)
		const signInRes = await request(httpServer)
			.post("/auth/sign-in")
			.send({ email: signUpDto.email, password: signUpDto.password })
			.expect(200);
		const { accessToken } = signInRes.body as { accessToken: string };
		expect(accessToken).toBeDefined();
		const setCookieHeader = signInRes.headers[
			"set-cookie"
		] as unknown as string[];
		expect(setCookieHeader.join(";")).toContain("refresh=");

		// password-recovery
		await request(httpServer)
			.post("/auth/password-recovery")
			.send({ email: signUpDto.email })
			.expect(204);

		const recoveryKeys = await redis.keys("recovery:*");
		expect(recoveryKeys.length).toBe(1);
		const recoveryToken = recoveryKeys[0].replace("recovery:", "");

		// new-password
		const newPassword = "NewPassword1";
		await request(httpServer)
			.post("/auth/new-password")
			.send({ token: recoveryToken, password: newPassword })
			.expect(204);

		expect(await redis.keys("recovery:*")).toHaveLength(0);

		// sign-in со старым паролем должно дать 401
		await request(httpServer)
			.post("/auth/sign-in")
			.send({ email: signUpDto.email, password: signUpDto.password })
			.expect(401);

		// sign-in с новым паролем
		const signInResNew = await request(httpServer)
			.post("/auth/sign-in")
			.send({ email: signUpDto.email, password: newPassword })
			.expect(200);
		const { accessToken: newAccessToken } = signInResNew.body as {
			accessToken: string;
		};
		expect(newAccessToken).toBeDefined();

		// два письма должны были отправиться: подтверждение и восстановление
		expect(
			mailServiceMock.sendMail.mock.calls.length
		).toBeGreaterThanOrEqual(2);
	});
});
