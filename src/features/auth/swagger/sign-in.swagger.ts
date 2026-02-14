import { applyDecorators } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { SignInResponseDto } from "@/features/auth/dto/responses/sign-in.response.dto";

export function SignInSwagger() {
	return applyDecorators(
		ApiOperation({ summary: "Авторизация пользователя." }),
		ApiOkResponse({ description: "Успешно", type: SignInResponseDto }),
		ApiBadRequestResponse({
			description: "Ошибка валидации отправленных полей.",
			example: ["email should not be empty"]
		}),
		ApiUnauthorizedResponse({
			description: "Не верный логин или пароль",
			example: ["Unauthorized"]
		})
	);
}
