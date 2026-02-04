import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response, Request } from "express";

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
	constructor(private readonly configService: ConfigService) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const responsePayload = exception.getResponse();
			response.status(status).send(responsePayload);
			return;
		}

		const message =
			exception instanceof Error
				? exception.message
				: "Unknown exception occurred.";
		const exceptionObj =
			typeof exception === "object" && exception !== null
				? exception
				: {};
		const status =
			"status" in exceptionObj &&
			exceptionObj.status === HttpStatus.TOO_MANY_REQUESTS
				? HttpStatus.TOO_MANY_REQUESTS
				: HttpStatus.I_AM_A_TEAPOT;
		const responseBody = this.buildResponseBody(request.url, message);
		response.status(status).send(responseBody);
	}

	private buildResponseBody(requestUrl: string, message: string) {
		const isProduction =
			this.configService.get<string>("NODE_ENV") === "production";

		if (isProduction) {
			return {
				message: "Some error occurred"
			};
		}

		return {
			timestamp: new Date().toISOString(),
			message,
			path: requestUrl
		};
	}
}
