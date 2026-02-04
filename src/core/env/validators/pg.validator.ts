import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class PgValidator {
	@IsString()
	@IsNotEmpty()
	public DB_USER: string;

	@IsString()
	@IsNotEmpty()
	public DB_PASS: string;

	@IsString()
	@IsNotEmpty()
	public DB_HOST: string;

	@IsNumber()
	@IsPositive()
	public DB_PORT: number;

	@IsString()
	@IsNotEmpty()
	public DB_NAME: string;
}
