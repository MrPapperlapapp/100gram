import { applyDecorators } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiNoContentResponse,
	ApiOperation
} from "@nestjs/swagger";
import { ResendConfirmationTokenRequestDto } from "@/features/auth/dto/requests/resend-confirmation-token.request.dto";

export function ResendConfirmationSwagger() {
	return applyDecorators(
		ApiOperation({
			summary: "Повторная отправка кода подтверждения email."
		}),
		ApiBody({ type: ResendConfirmationTokenRequestDto }),
		ApiNoContentResponse({
			description:
				"Письмо для подтверждения отправлено, если пользователь существует и email не подтвержден."
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
