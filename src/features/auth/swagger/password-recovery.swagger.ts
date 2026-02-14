import { applyDecorators } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiNoContentResponse,
	ApiOperation
} from "@nestjs/swagger";
import { PasswordRecoverRequestDto } from "@/features/auth/dto/requests/password-recover.request.dto";

export function PasswordRecoverySwagger() {
	return applyDecorators(
		ApiOperation({ summary: "Запрос на восстановление пароля." }),
		ApiBody({ type: PasswordRecoverRequestDto }),
		ApiNoContentResponse({
			description:
				"Письмо для восстановления пароля отправлено, если пользователь существует."
		}),
		ApiBadRequestResponse({
			description: "Ошибка валидации отправленных полей.",
			example: {
				message: ["email must be an email"],
				error: "Bad Request",
				statusCode: 400
			}
		})
	);
}
