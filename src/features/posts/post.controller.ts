import { Body, Controller, Post, Req } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
	CreatePostCommand,
	UploadPhotosCommand
} from "@/features/posts/application/commands";
import { CreatePostRequestDto } from "@/features/posts/dto/request/create-post.request.dto";
import { UploadInitRequestDto } from "@/features/posts/dto/request/generate-photos-presigned-urls.request.dto";
import { PresignedPostUploadSessionResponseDto } from "@/features/posts/dto/response/presigned-post-upload-session.response.dto";
import { Protected } from "@/shared/decorators/protected.decorator";
import type { Request } from "express";
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("posts")
@ApiBearerAuth()
@Controller("posts")
export class PostController {
	constructor(private readonly commandBus: CommandBus) {}

	@Protected()
	@Post()
	async create(
		@Body() { title, content, uploadId }: CreatePostRequestDto,
		@Req() req: Request
	) {
		return this.commandBus.execute<CreatePostCommand, void>(
			new CreatePostCommand(title, content, req.user.id, uploadId)
		);
	}

	@ApiCreatedResponse({ type: PresignedPostUploadSessionResponseDto })
	@Protected()
	@Post("upload/image")
	async uploadImage(
		@Body() { count }: UploadInitRequestDto,
		@Req() req: Request
	) {
		return this.commandBus.execute<
			UploadPhotosCommand,
			PresignedPostUploadSessionResponseDto
		>(new UploadPhotosCommand(req.user.id, count));
	}
}
