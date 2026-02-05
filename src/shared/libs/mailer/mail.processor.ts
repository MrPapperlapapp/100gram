import { Injectable, Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { MailService } from "@/shared/libs/mailer/mail.service";
import { Job } from "bullmq";

@Processor("email")
@Injectable()
export class MailProcessor extends WorkerHost {
	private readonly logger = new Logger(MailProcessor.name);

	constructor(private readonly mailService: MailService) {
		super();
	}

	async process(
		job: Job<{
			email: string;
			token: string;
			subject: string;
			template: string;
		}>
	) {
		const { subject, template, token, email } = job.data;
		try {
			await this.mailService.sendMail(email, subject, template, {
				token
			});
		} catch (err: unknown) {
			this.logger.error("Mailer error", {
				error: err instanceof Error ? err.message : err
			});
		}
	}
}
