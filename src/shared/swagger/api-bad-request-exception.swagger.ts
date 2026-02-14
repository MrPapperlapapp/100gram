import { applyDecorators } from "@nestjs/common";
import { ApiBadRequestResponse } from "@nestjs/swagger";

export function ApiBadRequestExceptionSwagger(
	message: string = "Ошибка валидации",
	description: string = "Ошибка валидации"
) {
	return applyDecorators(
		ApiBadRequestResponse({
			description,
			schema: {
				example: {
					statusCode: 400,
					message,
					error: "Bad Request"
				}
			}
		})
	);
}
