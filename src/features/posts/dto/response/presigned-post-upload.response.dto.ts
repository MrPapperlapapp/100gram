import { ApiProperty } from "@nestjs/swagger";
import type { PresignedPostUpload } from "@/shared/libs/storage/storage.service";

export class PresignedPostUploadResponseDto implements PresignedPostUpload {
	@ApiProperty({
		example:
			"posts/USER_ID/UPLOAD_ID/550e8400-e29b-41d4-a716-446655440000.jpg"
	})
	key: string;

	@ApiProperty({ example: "https://s3.example.com/my-bucket" })
	url: string;

	@ApiProperty({ enum: ["POST"], example: "POST" })
	method: "POST";

	@ApiProperty({
		type: "object",
		additionalProperties: { type: "string" },
		example: {
			key: "posts/USER_ID/UPLOAD_ID/550e8400-e29b-41d4-a716-446655440000.jpg",
			"Content-Type": "image/jpeg",
			Policy: "...",
			"X-Amz-Algorithm": "AWS4-HMAC-SHA256",
			"X-Amz-Credential": "...",
			"X-Amz-Date": "20260211T074500Z",
			"X-Amz-Signature": "..."
		}
	})
	fields: Record<string, string>;

	static mapToView(
		values: PresignedPostUpload
	): PresignedPostUploadResponseDto {
		return {
			key: values.key,
			url: values.url,
			method: values.method,
			fields: values.fields
		};
	}
}
