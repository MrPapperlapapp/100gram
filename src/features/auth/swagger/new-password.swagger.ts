import { applyDecorators } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOperation
} from "@nestjs/swagger";
import { NewPasswordRequestDto } from "@/features/auth/dto/requests/new-password.request.dto";

export function NewPasswordSwagger() {
	return applyDecorators(
		ApiOperation({ summary: "Установка нового пароля." }),
		ApiBody({ type: NewPasswordRequestDto }),
		ApiNoContentResponse({ description: "Пароль успешно изменен." }),
		ApiBadRequestResponse({
			description:
				"Ошибка валидации отправленных полей или невалидный токен.",
			example: {
				message: "Не валидный код восстановления пароля.",
				error: "Bad Request",
				statusCode: 400
			}
		}),
		ApiNotFoundResponse({
			description: "Пользователь не найден.",
			example: {
				message: "Пользователь не найден.",
				error: "Not Found",
				statusCode: 404
			}
		})
	);
}
