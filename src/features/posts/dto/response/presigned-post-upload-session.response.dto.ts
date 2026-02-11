import { ApiProperty } from "@nestjs/swagger";
import { PresignedPostUploadResponseDto } from "./presigned-post-upload.response.dto";

export class PresignedPostUploadSessionResponseDto {
	@ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
	uploadId: string;

	@ApiProperty({ type: [PresignedPostUploadResponseDto] })
	uploads: PresignedPostUploadResponseDto[];
}
