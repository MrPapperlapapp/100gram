import { applyDecorators } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiNoContentResponse,
	ApiOperation
} from "@nestjs/swagger";

export function SignUpSwagger() {
	return applyDecorators(
		ApiOperation({ summary: "Регистрация пользователя." }),
		ApiNoContentResponse({ description: "Успешно" }),
		ApiBadRequestResponse({
			description: "Ошибка валидации отправленных полей.",
			example: {
				message: ["email should not be empty"],
				error: "Bad Request",
				statusCode: 400
			}
		}),
		ApiConflictResponse({
			description:
				"Пользователь с таким email или username уже существует.",
			example: {
				message: "Unauthorized",
				statusCode: 409
			}
		})
	);
}
