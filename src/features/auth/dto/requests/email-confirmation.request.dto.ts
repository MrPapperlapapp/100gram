import { IsNotEmpty, IsString } from "class-validator";

export class EmailConfirmationRequestDto {
	@IsString()
	@IsNotEmpty()
	token: string;
}
