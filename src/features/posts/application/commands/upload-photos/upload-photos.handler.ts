import { BadRequestException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UploadPhotosCommand } from "@/features/posts/application/commands/upload-photos/upload-photos.command";
import { PresignedPostUploadSessionResponseDto } from "@/features/posts/dto/response/presigned-post-upload-session.response.dto";
import { PresignedPostUploadResponseDto } from "@/features/posts/dto/response/presigned-post-upload.response.dto";
import { PostPhotoUploadRepository } from "@/features/posts/infrastructure/post-photo-upload.repository";
import { StorageService } from "@/shared/libs/storage/storage.service";
import { randomUUID } from "node:crypto";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const SESSION_CONTENT_TYPE = "auto";

@CommandHandler(UploadPhotosCommand)
export class UploadPhotosHandler implements ICommandHandler<
	UploadPhotosCommand,
	PresignedPostUploadSessionResponseDto
> {
	constructor(
		private readonly storageService: StorageService,
		private readonly postPhotoUploadRepository: PostPhotoUploadRepository
	) {}

	async execute({ userId, count }: UploadPhotosCommand) {
		if (count > 10) {
			throw new BadRequestException("Max 10 images");
		}

		const uploadId = randomUUID();

		const uploadsUrls =
			await this.storageService.generatePresignedUploadPosts(
				`posts/${userId}/${uploadId}`,
				count,
				{ maxSizeBytes: MAX_SIZE_BYTES }
			);

		await this.postPhotoUploadRepository.createSession({
			id: uploadId,
			userId,
			contentType: SESSION_CONTENT_TYPE,
			count,
			maxSizeBytes: MAX_SIZE_BYTES
		});

		await this.postPhotoUploadRepository.createFiles(
			uploadId,
			uploadsUrls.map((u) => u.key)
		);

		return {
			uploadId,
			uploads: uploadsUrls.map((u) =>
				PresignedPostUploadResponseDto.mapToView(u)
			)
		};
	}
}
