import { IsNotEmpty, IsString } from "class-validator";

export class JwtValidator {
	@IsString()
	@IsNotEmpty()
	public JWT_SECRET: string;
}
