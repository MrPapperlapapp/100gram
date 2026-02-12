import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	Length
} from "class-validator";

export class CreatePostRequestDto {
	@ApiProperty({ example: "My post title" })
	@IsString()
	@IsNotEmpty()
	@Length(3, 255)
	title: string;

	@ApiPropertyOptional({ example: "My post content" })
	@IsString()
	@IsOptional()
	@Length(0, 5000)
	content?: string;

	@ApiPropertyOptional({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description:
			"Optional upload session id returned from POST /posts/upload/init"
	})
	@IsOptional()
	@IsUUID()
	uploadId?: string;
}
