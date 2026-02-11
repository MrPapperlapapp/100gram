import { Module } from "@nestjs/common";
import { PostController } from "@/features/posts/post.controller";
import { PostRepository } from "@/features/posts/infrastructure/post.repository";
import { PostPhotoUploadRepository } from "@/features/posts/infrastructure/post-photo-upload.repository";
import {
	CreatePostCommandHandler,
	UploadPhotosHandler
} from "@/features/posts/application/commands";
import { StorageModule } from "@/shared/libs/storage/storage.module";

const commands = [CreatePostCommandHandler, UploadPhotosHandler];

@Module({
	imports: [StorageModule],
	controllers: [PostController],
	providers: [PostRepository, PostPhotoUploadRepository, ...commands]
})
export class PostModule {}
