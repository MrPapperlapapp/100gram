import { registerAs } from "@nestjs/config";

import { S3Validator, validateEnv } from "./validators";
import { IS3Config } from "./interfaces";

export const s3Env = registerAs<IS3Config>("s3", () => {
	validateEnv(process.env, S3Validator);
	return {
		endpoint: process.env.S3_ENDPOINT,
		accessKeyId: process.env.S3_ACCESS_KEY_ID,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
		region: process.env.S3_REGION,
		bucketName: process.env.S3_BUCKET
	};
});
