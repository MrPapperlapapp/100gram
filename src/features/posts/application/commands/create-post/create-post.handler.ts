import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UploadSessionStatus } from "@prisma/generated/enums";
import { CreatePostCommand } from "@/features/posts/application/commands/create-post/create-post.command";
import { PostPhotoUploadRepository } from "@/features/posts/infrastructure/post-photo-upload.repository";
import { PostRepository } from "@/features/posts/infrastructure/post.repository";
import { StorageService } from "@/shared/libs/storage/storage.service";

const ALLOWED_CONTENT_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp"
] as const;

type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

function isAllowedContentType(value: string): value is AllowedContentType {
	return (ALLOWED_CONTENT_TYPES as readonly string[]).includes(value);
}

function detectImageContentType(
	bytes: Uint8Array
): AllowedContentType | "image/gif" | "unknown" {
	// JPEG: FF D8 FF
	if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8) {
		return "image/jpeg";
	}

	// PNG: 89 50 4E 47 0D 0A 1A 0A
	if (
		bytes.length >= 8 &&
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47 &&
		bytes[4] === 0x0d &&
		bytes[5] === 0x0a &&
		bytes[6] === 0x1a &&
		bytes[7] === 0x0a
	) {
		return "image/png";
	}

	// WEBP: "RIFF" .... "WEBP"
	if (
		bytes.length >= 12 &&
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		return "image/webp";
	}

	// GIF: "GIF87a" or "GIF89a"
	if (
		bytes.length >= 6 &&
		bytes[0] === 0x47 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x38 &&
		(bytes[4] === 0x37 || bytes[4] === 0x39) &&
		bytes[5] === 0x61
	) {
		return "image/gif";
	}

	return "unknown";
}

@CommandHandler(CreatePostCommand)
export class CreatePostCommandHandler implements ICommandHandler<
	CreatePostCommand,
	void
> {
	constructor(
		private readonly postRepository: PostRepository,
		private readonly storageService: StorageService,
		private readonly postPhotoUploadRepository: PostPhotoUploadRepository
	) {}

	async execute({ title, content, userId, uploadId }: CreatePostCommand) {
		if (!uploadId) {
			await this.postRepository.create({ title, content }, userId);
			return;
		}

		const session =
			await this.postPhotoUploadRepository.getSessionWithFiles(
				uploadId,
				userId
			);

		if (!session) {
			throw new NotFoundException("Upload session not found");
		}

		if (session.status === UploadSessionStatus.COMPLETED) {
			throw new BadRequestException("Upload session already completed");
		}

		if (session.files.length === 0) {
			throw new BadRequestException("No files in upload session");
		}

		const verifiedFiles = await Promise.all(
			session.files.map(async (file) => {
				const head = await this.storageService
					.headObject(file.key)
					.catch(() => {
						throw new BadRequestException(
							`File not found: ${file.key}`
						);
					});

				const declaredContentType = head.ContentType;
				const sizeBytes = head.ContentLength;
				const etag = head.ETag?.replaceAll('"', "");

				if (sizeBytes == null) {
					throw new BadRequestException(
						`Could not determine file size for: ${file.key}`
					);
				}

				if (sizeBytes > session.maxSizeBytes) {
					throw new BadRequestException(
						`File too large (> ${session.maxSizeBytes} bytes): ${file.key}`
					);
				}

				const magicBytes = await this.storageService
					.getObjectRange(file.key, "bytes=0-15")
					.catch(() => {
						throw new BadRequestException(
							`Could not read file: ${file.key}`
						);
					});

				const detectedContentType = detectImageContentType(magicBytes);

				if (!isAllowedContentType(detectedContentType)) {
					throw new BadRequestException(
						`Unsupported file signature: ${file.key}`
					);
				}

				if (
					declaredContentType &&
					declaredContentType !== "application/octet-stream" &&
					declaredContentType !== "binary/octet-stream" &&
					declaredContentType !== detectedContentType
				) {
					throw new BadRequestException(
						`File content type mismatch (expected ${detectedContentType}, got ${declaredContentType}): ${file.key}`
					);
				}

				return {
					key: file.key,
					contentType: detectedContentType,
					sizeBytes,
					etag
				};
			})
		);

		await this.postPhotoUploadRepository.verifyFiles(verifiedFiles);

		await this.postRepository.create(
			{ title, content },
			userId,
			verifiedFiles.map((file) => ({
				key: file.key,
				url: this.storageService.getPublicUrl(file.key)
			}))
		);

		await this.postPhotoUploadRepository.markSessionCompleted(uploadId);
	}
}
