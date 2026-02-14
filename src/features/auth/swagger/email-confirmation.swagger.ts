import { applyDecorators } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOperation
} from "@nestjs/swagger";
import { EmailConfirmationRequestDto } from "@/features/auth/dto/requests/email-confirmation.request.dto";

export function EmailConfirmationSwagger() {
	return applyDecorators(
		ApiOperation({ summary: "Подтверждение email пользователя." }),
		ApiBody({ type: EmailConfirmationRequestDto }),
		ApiNoContentResponse({ description: "Email успешно подтвержден." }),
		ApiBadRequestResponse({
			description:
				"Ошибка валидации отправленных полей или невалидный токен.",
			example: {
				message: "Не валидный токен.",
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
