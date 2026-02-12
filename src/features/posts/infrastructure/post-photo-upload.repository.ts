import { Injectable } from "@nestjs/common";
import { UploadFileStatus, UploadSessionStatus } from "@prisma/generated/enums";
import { PrismaService } from "@/shared/libs/prisma";

@Injectable()
export class PostPhotoUploadRepository {
	constructor(private readonly prisma: PrismaService) {}

	async createSession(data: {
		id: string;
		userId: string;
		contentType: string;
		count: number;
		maxSizeBytes: number;
	}) {
		return this.prisma.postPhotoUploadSession.create({
			data: {
				...data,
				status: UploadSessionStatus.INIT
			}
		});
	}

	async createFiles(sessionId: string, keys: string[]) {
		return this.prisma.postPhotoUploadFile.createMany({
			data: keys.map((key) => ({
				key,
				sessionId,
				status: UploadFileStatus.PRESIGNED
			}))
		});
	}

	async getSessionWithFiles(uploadId: string, userId: string) {
		return this.prisma.postPhotoUploadSession.findFirst({
			where: {
				id: uploadId,
				userId
			},
			include: {
				files: true
			}
		});
	}

	async markSessionCompleted(uploadId: string) {
		return this.prisma.postPhotoUploadSession.update({
			where: { id: uploadId },
			data: {
				status: UploadSessionStatus.COMPLETED,
				completedAt: new Date()
			}
		});
	}

	async verifyFiles(
		files: Array<{
			key: string;
			contentType: string;
			sizeBytes: number;
			etag?: string;
		}>
	) {
		const now = new Date();

		return this.prisma.$transaction(
			files.map((file) =>
				this.prisma.postPhotoUploadFile.update({
					where: { key: file.key },
					data: {
						status: UploadFileStatus.VERIFIED,
						contentType: file.contentType,
						sizeBytes: file.sizeBytes,
						etag: file.etag,
						verifiedAt: now
					}
				})
			)
		);
	}
}
