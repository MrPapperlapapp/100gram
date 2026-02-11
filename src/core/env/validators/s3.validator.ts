import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class S3Validator {
	@IsString()
	@IsNotEmpty()
	@IsUrl({ require_tld: false })
	S3_ENDPOINT: string;

	@IsString()
	@IsNotEmpty()
	S3_ACCESS_KEY_ID: string;

	@IsString()
	@IsNotEmpty()
	S3_SECRET_ACCESS_KEY: string;

	@IsString()
	@IsNotEmpty()
	S3_REGION: string;

	@IsString()
	@IsNotEmpty()
	S3_BUCKET: string;
}
