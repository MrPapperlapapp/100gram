import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) {}

	async sendMail(
		to: string,
		subject: string,
		template: string,
		context: Record<string, any>
	) {
		await this.mailerService.sendMail({
			to,
			subject,
			context,
			template
		});
	}
}
