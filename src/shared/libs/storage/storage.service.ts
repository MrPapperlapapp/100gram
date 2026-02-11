import { BadRequestException, Injectable } from "@nestjs/common";
import {
	GetObjectCommand,
	HeadObjectCommand,
	S3Client,
	type HeadObjectCommandOutput
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { ConfigService } from "@nestjs/config";
import { IAllConfigsInterface } from "@/core/env/interfaces";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { buffer } from "node:stream/consumers";

export type UploadImageDescriptor = {
	contentType: string;
};

export type PresignedPostUpload = {
	key: string;
	url: string;
	method: "POST";
	fields: Record<string, string>;
};

@Injectable()
export class StorageService {
	private readonly client: S3Client;
	private readonly bucket: string;
	private readonly endpoint: string;

	public constructor(
		private readonly configService: ConfigService<IAllConfigsInterface>
	) {
		this.endpoint = configService.get("s3.endpoint", { infer: true });

		this.client = new S3Client({
			endpoint: this.endpoint,
			credentials: {
				accessKeyId: configService.get("s3.accessKeyId", {
					infer: true
				}),
				secretAccessKey: configService.get("s3.secretAccessKey", {
					infer: true
				})
			},
			region: configService.get("s3.region", { infer: true })
		});
		this.bucket = configService.get("s3.bucketName", { infer: true });
	}

	getPublicUrl(key: string): string {
		const url = new URL(this.endpoint);

		const parts = [url.pathname, this.bucket, key]
			.filter(Boolean)
			.map((p) => p.replace(/^\/+|\/+$/g, ""))
			.filter((p) => p.length > 0);

		url.pathname = `/${parts.join("/")}`;

		return url.toString();
	}

	async headObject(key: string): Promise<HeadObjectCommandOutput> {
		return this.client.send(
			new HeadObjectCommand({
				Bucket: this.bucket,
				Key: key
			})
		);
	}

	async getObjectRange(key: string, range: string): Promise<Uint8Array> {
		const { Body } = await this.client.send(
			new GetObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Range: range
			})
		);

		if (!Body) {
			throw new BadRequestException("Empty file body");
		}

		if (!(Body instanceof Readable)) {
			throw new BadRequestException("Unsupported body type");
		}

		return buffer(Body);
	}

	async presignedPost(options: {
		key: string;
		maxSizeBytes: number;
		expiresInSeconds?: number;
		contentType?: string;
	}): Promise<PresignedPostUpload> {
		type PresignedPostPolicyEntry =
			| ["eq", string, string]
			| ["starts-with", string, string]
			| ["content-length-range", number, number]
			| Record<string, string>;

		const conditions: PresignedPostPolicyEntry[] = [
			["content-length-range", 0, options.maxSizeBytes]
		];

		const fields: Record<string, string> = {};

		if (options.contentType) {
			conditions.push(["eq", "$Content-Type", options.contentType]);
			fields["Content-Type"] = options.contentType;
		}

		const { url, fields: presignedFields } = await createPresignedPost(
			this.client,
			{
				Bucket: this.bucket,
				Key: options.key,
				Conditions: conditions,
				Fields: fields,
				Expires: options.expiresInSeconds ?? 60 * 5
			}
		);

		return {
			key: options.key,
			url,
			method: "POST",
			fields: presignedFields
		};
	}

	async generatePresignedUploadPosts(
		folder: string,
		count: number,
		options?: {
			maxSizeBytes?: number;
			expiresInSeconds?: number;
		}
	): Promise<PresignedPostUpload[]> {
		const maxSizeBytes = options?.maxSizeBytes ?? 10 * 1024 * 1024;

		return Promise.all(
			Array.from({ length: count }, async () => {
				const key = `${folder}/${randomUUID()}`;

				return this.presignedPost({
					key,
					maxSizeBytes,
					expiresInSeconds: options?.expiresInSeconds
				});
			})
		);
	}

	async generatePresignedImageUploadPosts(
		folder: string,
		files: UploadImageDescriptor[],
		options?: {
			maxSizeBytes?: number;
			expiresInSeconds?: number;
		}
	): Promise<PresignedPostUpload[]> {
		const maxSizeBytes = options?.maxSizeBytes ?? 10 * 1024 * 1024;

		return Promise.all(
			files.map(async (file) => {
				const ext = this.getExtensionByContentType(file.contentType);
				const key = `${folder}/${randomUUID()}${ext}`;

				return this.presignedPost({
					key,
					contentType: file.contentType,
					maxSizeBytes,
					expiresInSeconds: options?.expiresInSeconds
				});
			})
		);
	}

	private getExtensionByContentType(contentType: string): string {
		switch (contentType) {
			case "image/jpeg":
				return ".jpg";
			case "image/png":
				return ".png";
			case "image/webp":
				return ".webp";
			default:
				throw new BadRequestException("Unsupported content type");
		}
	}
}
