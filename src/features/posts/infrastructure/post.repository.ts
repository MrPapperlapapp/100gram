import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/shared/libs/prisma";

@Injectable()
export class PostRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(
		data: { title: string; content?: string },
		userId: string,
		photos?: Array<{ key: string; url: string }>
	): Promise<string> {
		const { content, title } = data;
		const post = await this.prisma.post.create({
			data: {
				...(content != null && { content }),
				title,
				user: {
					connect: { id: userId }
				},
				...(photos != null &&
					photos.length > 0 && {
						photos: {
							createMany: {
								data: photos
							}
						}
					})
			}
		});

		return post.id;
	}
}
