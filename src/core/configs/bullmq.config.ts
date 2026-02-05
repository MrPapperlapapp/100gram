import { ConfigService } from "@nestjs/config";
import { IAllConfigsInterface } from "@/core/env/interfaces";
import { QueueOptions } from "bullmq";

export function bullmqConfig(
	configService: ConfigService<IAllConfigsInterface>
): QueueOptions {
	return {
		connection: {
			maxRetriesPerRequest: null,
			host: configService.get("redis.host", { infer: true }),
			port: configService.get("redis.port", { infer: true }),
			username: configService.get("redis.user", { infer: true }),
			password: configService.get("redis.pass", { infer: true })
		},
		prefix: "queue"
	};
}
