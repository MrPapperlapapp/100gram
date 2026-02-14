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
			example: ["email should not be empty"]
		}),
		ApiConflictResponse({
			description:
				"Пользователь с таким email или username уже существует.",
			example: ["Пользователь с таким email существует."]
		})
	);
}
